import { intro } from './views/intro.js';
import { portalHome, browse, serviceDetail } from './views/portal.js';
import { agencyList, agencyDetail, placeList, placeDetail, complaints, faqView, dataPolicy, phase } from './views/directory.js';
import { mapView, projectDetail } from './views/map.js';
import { mountAssistant } from './assistant.js';
import { searchServices } from './lib/search.js';
import { esc } from './ui.js';

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
  [/^\/project\/([\w-]+)$/, (m) => projectDetail({ id: m[1] }), 'map'],
  [/^\/discover$/, phase('discover'), 'discover'],
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
  if (!out) out = { title: 'غير موجود', html: '<div class="empty"><h3>الصفحة غير موجودة</h3><p><a class="btn btn--primary" href="#/services">العودة للخدمات</a></p></div>' };
  view.innerHTML = `<div class="page">${out.html}</div>`;
  document.title = out.title === 'الدقهلية 360°' ? 'الدقهلية 360° · Dakahlia 360°' : `${out.title} · الدقهلية 360°`;
  document.querySelectorAll('[data-nav-id]').forEach((a) => a.classList.toggle('on', a.dataset.navId === section));
  document.body.classList.remove('menu-open');
  if (!out.keepScroll) window.scrollTo({ top: 0 });
  out.mount?.(view);
  view.focus({ preventScroll: true });
}

// Global delegated behaviours (work for every view).
document.addEventListener('submit', (e) => {
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
  if (e.target.closest('[data-menu]')) document.body.classList.toggle('menu-open');
  if (!e.target.closest('.sbox')) document.querySelectorAll('.sbox__suggest').forEach((x) => (x.hidden = true));
});

// Live suggestions under any search box.
document.addEventListener('input', (e) => {
  const inp = e.target.closest('.sbox input'); if (!inp) return;
  const box = inp.closest('.sbox').querySelector('.sbox__suggest');
  const q = inp.value.trim();
  const res = q.length > 1 ? searchServices(q).slice(0, 5) : [];
  box.hidden = !res.length;
  box.innerHTML = res.map((r) => `<a href="#/service/${r.s.id}" role="option">${esc(r.s.title)}</a>`).join('');
});

window.addEventListener('hashchange', render);
mountAssistant();
render();
