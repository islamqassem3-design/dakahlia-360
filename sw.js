// Service worker: makes the site installable and fast on repeat visits.
// Pages: network first (always fresh when online), cached copy when offline.
// Versioned assets (?v=): cache first. Fonts/icons/Leaflet from CDNs: cache first. Map tiles and AI calls: not cached.
const VERSION = 'd360-202611261647';
const CORE = ['./', './index.html', './manifest.webmanifest', './assets/icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
const CDN = /(fonts\.googleapis\.com|fonts\.gstatic\.com|unpkg\.com)$/;
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  const same = url.origin === self.location.origin;
  if ((same && url.search.includes('v=')) || (same && /\.(png|webmanifest)$/.test(url.pathname)) || CDN.test(url.hostname)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return r; })));
  }
});
