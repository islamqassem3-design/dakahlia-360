// Shared UI building blocks (design system components as template functions).
import { sources, STATUS, CHECKED_AT } from './data/meta.js';
import { agencies, categories } from './data/catalog.js';

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const agencyById = Object.fromEntries(agencies.map((a) => [a.id, a]));
export const catById = Object.fromEntries(categories.map((c) => [c.id, c]));

const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  arrow: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
  ext: '<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  id: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.4 1.7-2 3-2s2.4.6 3 2M15 10h3M15 13h3"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v2H3z"/><circle cx="7.5" cy="13.5" r="1"/><circle cx="16.5" cy="13.5" r="1"/>',
  store: '<path d="M4 9 5.5 4h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11z"/><path d="M5 13v7h14v-7M10 20v-4h4v4"/>',
  building: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18"/>',
  bolt: '<path d="M13 3 5 14h6l-1 7 8-11h-6z"/>',
  health: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M19 19v2H6"/>',
  basket: '<path d="M4 10h16l-1.5 9h-13z"/><path d="m8 10 3-6M16 10l-3-6"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  phone: '<path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  send: '<path d="M20 4 4 11l6 2 2 6z"/><path d="m10 13 4-4"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  home: '<path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  shield: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
};
export const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || P.info}</svg>`;

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
  return `<p class="srcnote">${icon('shield')}<span>المصدر: <a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a> — ${st}</span></p>`;
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
