// Shared UI building blocks (design system components as template functions).
import { sources, STATUS, CHECKED_AT } from './data/meta.js?v=202611261618';
import { agencies, categories } from './data/catalog.js?v=202611261618';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const agencyById = Object.fromEntries(agencies.map((a) => [a.id, a]));
export const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

// Icons: Phosphor (regular), per the design system. Names map app concepts to Phosphor glyphs.
const PH = {
  search: 'magnifying-glass', arrow: 'arrow-left', ext: 'arrow-square-out', id: 'identification-card', car: 'car',
  store: 'storefront', building: 'buildings', heart: 'heart', briefcase: 'briefcase', bolt: 'lightning', water: 'drop',
  health: 'first-aid', book: 'book-open', basket: 'basket', chart: 'chart-line-up', chat: 'chat-circle-text',
  phone: 'phone', globe: 'globe-simple', pin: 'map-pin', spark: 'sparkle', close: 'x', send: 'paper-plane-tilt',
  check: 'check', info: 'info', layers: 'stack', map: 'map-trifold', compass: 'compass', home: 'house',
  grid: 'squares-four', shield: 'shield-check', menu: 'list',
  leaf: 'leaf', trash: 'trash', cpu: 'cpu', kanban: 'kanban', wrench: 'wrench', city: 'city', flask: 'flask',
  bulb: 'lightbulb', bars: 'chart-bar', printer: 'printer', download: 'download-simple', link: 'link', merge: 'git-merge',
  star: 'star', rocket: 'rocket-launch', calendar: 'calendar-check', clipboard: 'clipboard-text', mobile: 'device-mobile',
  browser: 'browser', gauge: 'gauge', warning: 'warning', next: 'arrow-right', reset: 'arrow-counter-clockwise',
  plus: 'plus', funnel: 'funnel', ok: 'check-circle', no: 'x-circle', edit: 'pencil-simple',
};
export const icon = (n, cls = '') => `<i class="ph ph-${PH[n] || 'info'} ic ${cls}" aria-hidden="true"></i>`;

export const badge = (status, text) => {
  const st = STATUS[status] || STATUS.unverified;
  return `<span class="badge badge--${st.tone}">${esc(text || st.label)}</span>`;
};

export const sourceLink = (key, label) => {
  const s = sources[key]; if (!s) return '';
  return `<a class="src" href="${s.url}" target="_blank" rel="noopener">${icon('ext')}<span>${esc(label || s.name)}</span></a>`;
};

export const sourceNote = (key) => {
  const s = sources[key]; if (!s) return '';
  const st = s.status === 'verified' ? `تم فحص الرابط بتاريخ ${CHECKED_AT}` : `${STATUS[s.status].label} (فحص ${CHECKED_AT})`;
  return `<p class="srcnote">${icon('shield')}<span>المصدر: <a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>، ${st}</span></p>`;
};

export const serviceCard = (s, extra = '') => {
  const a = agencyById[s.agency]; const c = catById[s.cat];
  const online = s.channels.some((x) => x.kind === 'online');
  const phone = s.channels.find((x) => x.kind === 'phone');
  return `<a class="scard" href="#/service/${s.id}">
    <span class="scard__ic">${icon(c.icon)}</span>
    <span class="scard__body">
      <span class="scard__t">${esc(s.title)}</span>
      <span class="scard__m">${esc(a?.name || '')}</span>
      <span class="chips">${online ? '<span class="chip">رابط إلكتروني</span>' : ''}${s.channels.some((x) => x.kind === 'office') ? '<span class="chip">حضوري</span>' : ''}${phone ? `<span class="chip">خط ${phone.number}</span>` : ''}${extra}</span>
    </span>
    <span class="scard__go">${icon('arrow')}</span>
  </a>`;
};

export const crumbs = (items) => `<nav class="crumbs" aria-label="مسار التنقل">${items.map(([t, h], i) => (h && i < items.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`)).join('<span class="sep">/</span>')}</nav>`;

export const searchBox = (value = '', big = false, ph = 'اكتب ما تريد إنجازه… مثال: عايز أطلع ترخيص لمحل') => `
  <form class="sbox ${big ? 'sbox--big' : ''}" data-search role="search">
    ${icon('search')}
    <input name="q" type="search" value="${esc(value)}" placeholder="${esc(ph)}" aria-label="ابحث عن خدمة" autocomplete="off" />
    <button class="btn btn--primary" type="submit">بحث</button>
    <div class="sbox__suggest" hidden></div>
  </form>`;

export const empty = (title, body, action = '') => `<div class="empty">${icon('info')}<h3>${esc(title)}</h3><p>${body}</p>${action}</div>`;
