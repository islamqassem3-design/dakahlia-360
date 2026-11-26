import { intro } from './views/intro.js';
import { portalHome, browse, serviceDetail } from './views/portal.js';
import { agencyList, agencyDetail, placeList, placeDetail, complaints, faqView, dataPolicy } from './views/directory.js';
import { discover, poiDetail, invest } from './views/discover.js';
import { mapView, projectDetail, projectBrief } from './views/map.js';
import { mountAssistant } from './assistant.js';
import { mountPalette, searchPage } from './palette.js';
import { searchServices } from './lib/search.js';
import { esc } from './ui.js';
import { privacy, terms, notFound } from './views/legal.js';
import { mountCursor } from './cursor.js';
import { mountAIPanel } from './aipanel.js';
import { ideas } from './views/ideas.js';
import { workspace, proposal } from './views/workspace.js';
import { lab } from './views/lab.js';
import { studio, proto } from './views/studio.js';

const routes = [
  [/^\/?$/, intro, 'home'],
  [/^\/services$/, portalHome, 'services'],
  [/^\/browse$/, browse, 'services'],
  [/^\/service\/([\w-]+)$/, (m, q) => serviceDetail({ id: m[1] }, q), 'services'],
  [/^\/agencies$/, agencyList, 'agencies'],
  [/^\/agency\/([\w-]+)$/, (m) => agencyDetail({ id: m[1] }), 'agencies'],
  [/^\/places$/, placeList, 'places'],
  [/^\/place\/([\w-]+)$/, (m) => placeDetail({ id: m[1] }), 'places'],
  [/^\/complaints$/, complaints, 'complaints'],
  [/^\/faq$/, faqView, 'services'],
  [/^\/data$/, dataPolicy, 'home'],
  [/^\/map$/, mapView, 'map'],
  [/^\/project\/([\w-]+)\/brief$/, (m) => projectBrief({ id: m[1] }), 'map'],
  [/^\/project\/([\w-]+)$/, (m) => projectDetail({ id: m[1] }), 'map'],
  [/^\/discover$/, discover, 'discover'],
  [/^\/poi\/([\w-]+)$/, (m) => poiDetail({ id: m[1] }), 'discover'],
  [/^\/invest$/, invest, 'discover'],
  [/^\/search$/, searchPage, ''],
  [/^\/privacy$/, privacy, ''],
  [/^\/ideas$/, ideas, 'ideas'],
  [/^\/idea\/([\w-]+)\/proposal$/, (m) => proposal({ id: m[1] }), 'ideas'],
  [/^\/idea\/([\w-]+)$/, (m, q) => workspace({ id: m[1] }, q), 'ideas'],
  [/^\/lab$/, lab, 'ideas'],
  [/^\/studio$/, studio, 'ideas'],
  [/^\/proto\/([\w-]+)$/, (m, q) => proto({ type: m[1] }, q), 'ideas'],
  [/^\/terms$/, terms, ''],
];

const view = document.getElementById('view');

function render() {
  const raw = location.hash.slice(1) || '/';
  const [path, qs = ''] = raw.split('?');
  const query = new URLSearchParams(qs);
  let out, section = '';
  for (const [re, fn, sec] of routes) {
    const m = path.match(re);
    if (m) { out = fn(m.length > 1 ? m : {}, query); section = sec; break; }
  }
  if (!out) out = notFound();
  view.innerHTML = `<div class="page">${out.html}</div>`;
  document.title = out.title === 'الدقهلية 360°' ? 'الدقهلية 360° · Dakahlia 360°' : `${out.title} · الدقهلية 360°`;
  document.querySelectorAll('[data-nav-id]').forEach((a) => a.classList.toggle('on', a.dataset.navId === section));
  setMenu(false);
  if (!out.keepScroll) window.scrollTo({ top: 0 });
  out.mount?.(view);
  reveal(view);
  view.focus({ preventScroll: true });
}

// ---- Motion (design system B7): scroll reveals + tagline word reveal ----
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let io;
function reveal(root) {
  const secs = root.querySelectorAll('[data-reveal]');
  if (reduce.matches || !('IntersectionObserver' in window)) { secs.forEach((s) => s.classList.add('in')); }
  else {
    io ||= new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px' });
    secs.forEach((s) => io.observe(s));
  }
  const tl = root.querySelector('[data-words]');
  if (tl) {
    tl.innerHTML = tl.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
    words = [...tl.querySelectorAll('.w')];
    if (reduce.matches) words.forEach((w) => w.classList.add('on')); else onScroll();
  } else words = [];
}
let words = [], ticking = false;
function onScroll() {
  if (ticking || !words.length) return;
  ticking = true;
  requestAnimationFrame(() => {
    const line = innerHeight * 0.62;
    // reading order: each word lights once it crosses the trigger line (never replays backwards)
    for (const w of words) { if (!w.classList.contains('on') && w.getBoundingClientRect().top < line) w.classList.add('on'); }
    ticking = false;
  });
}
addEventListener('scroll', onScroll, { passive: true });

// ---- Mobile menu: full height panel, animated toggle ----
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  document.querySelector('[data-menu]')?.setAttribute('aria-expanded', String(open));
  document.querySelector('.mpanel')?.setAttribute('aria-hidden', String(!open));
}

// Global delegated behaviours (work for every view).
document.addEventListener('submit', (e) => {
  const g = e.target.closest('[data-gsearch]');
  if (g) { e.preventDefault(); const q = g.q.value.trim(); location.hash = '/search' + (q ? '?q=' + encodeURIComponent(q) : ''); return; }
  const f = e.target.closest('[data-search]'); if (!f) return;
  e.preventDefault();
  const q = f.q.value.trim();
  location.hash = '/browse' + (q ? '?q=' + encodeURIComponent(q) : '');
});
document.addEventListener('change', (e) => {
  const s = e.target.closest('select[data-nav]'); if (s && s.value) location.hash = s.value.replace(/^#/, '');
});
document.addEventListener('click', (e) => {
  if (e.target.closest('a.skip')) { e.preventDefault(); view.focus(); return; }
  const sc = e.target.closest('[data-scroll]');
  if (sc) document.getElementById(sc.dataset.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (e.target.closest('[data-menu]')) setMenu(!document.body.classList.contains('menu-open'));
  else if (e.target.closest('.mpanel a')) setMenu(false);
  if (!e.target.closest('.sbox')) document.querySelectorAll('.sbox__suggest').forEach((x) => (x.hidden = true));
});

// Live suggestions under any search box.
document.addEventListener('input', (e) => {
  const inp = e.target.closest('.sbox input'); if (!inp) return;
  const box = inp.closest('.sbox').querySelector('.sbox__suggest'); if (!box) return;
  const q = inp.value.trim();
  const res = q.length > 1 ? searchServices(q).slice(0, 5) : [];
  box.hidden = !res.length;
  box.innerHTML = res.map((r) => `<a href="#/service/${r.s.id}" role="option">${esc(r.s.title)}</a>`).join('');
});

window.addEventListener('hashchange', render);
mountAssistant();
mountPalette();
mountCursor();
mountAIPanel();
render();
