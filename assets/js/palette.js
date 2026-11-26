// Unified search palette (Phase 04): one search box for services, places, landmarks, projects and agencies.
import { icon, esc, badge } from './ui.js?v=202611261557';
import { globalSearch } from './lib/globalsearch.js?v=202611261557';

export const groupsHtml = (res, close = false) => res.groups.map((g) => `
  <section class="sg"><h3 class="sg__t">${g.title}</h3>
    ${g.items.map((it) => `<a class="sg__i" href="${it.href}" ${close ? 'data-pclose' : ''}><span class="sg__ic">${icon(it.icon)}</span><span class="sg__b"><b>${esc(it.title)}</b><small>${esc(it.meta)}</small></span>${it.demo ? badge('demo') : ''}${icon('arrow', 'sg__go')}</a>`).join('')}
  </section>`).join('');

export function mountPalette() {
  const wrap = document.createElement('div');
  wrap.className = 'pal'; wrap.hidden = true;
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-label', 'البحث في الدقهلية 360°');
  wrap.innerHTML = `
    <div class="pal__scrim" data-pclose></div>
    <div class="pal__box">
      <form class="pal__f">${icon('search')}<input name="q" type="search" placeholder="ابحث في الخدمات والمراكز والمعالم والمشروعات…" autocomplete="off" aria-label="بحث موحد"/><kbd>Esc</kbd></form>
      <div class="pal__res" aria-live="polite"></div>
    </div>`;
  document.body.append(wrap);
  const inp = wrap.querySelector('input'); const out = wrap.querySelector('.pal__res');
  const tips = ['ترخيص محل', 'جمصة', 'مشروعات مياه', 'آثار', 'المنطقة الصناعية', 'مديرية الصحة'];
  const idle = () => { out.innerHTML = `<div class="pal__idle"><span class="caption-3">جرّب</span><div class="row gap-75">${tips.map((t) => `<button type="button" class="chip chip--btn" data-tip="${t}">${t}</button>`).join('')}</div></div>`; };
  const run = () => {
    const q = inp.value.trim(); if (!q) return idle();
    const res = globalSearch(q);
    out.innerHTML = res.total ? groupsHtml(res, true) + `<a class="pal__all" href="#/search?q=${encodeURIComponent(q)}" data-pclose>كل النتائج لـ «${esc(q)}» ${icon('arrow')}</a>`
      : `<div class="pal__idle"><p class="body-6">لا توجد نتائج مطابقة. جرّب كلمة أخرى، أو <button type="button" class="linkbtn" data-assistant="${esc(q)}" data-pclose>اسأل المساعد</button>.</p></div>`;
  };
  const open = () => { wrap.hidden = false; document.body.classList.add('noscroll'); inp.value = ''; idle(); requestAnimationFrame(() => inp.focus()); };
  const close = () => { wrap.hidden = true; document.body.classList.remove('noscroll'); };
  inp.addEventListener('input', run);
  wrap.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tip]'); if (t) { inp.value = t.dataset.tip; run(); inp.focus(); return; }
    if (e.target.closest('[data-pclose]')) close();
  });
  wrap.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const q = inp.value.trim(); if (q) { close(); location.hash = '/search?q=' + encodeURIComponent(q); } });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-palette]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !wrap.hidden) close();
    if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName))) { e.preventDefault(); open(); }
  });
  return { open, close };
}

export function searchPage(_, query) {
  const q = query.get('q') || '';
  const res = q ? globalSearch(q) : { total: 0, groups: [] };
  return {
    title: q ? `بحث: ${q}` : 'بحث',
    html: `
    <header class="phead"><p class="eyebrow">بحث موحد في الدقهلية 360°</p><h1 class="heading-3">${q ? `نتائج «${esc(q)}»` : 'ابحث في كل المنصة'}</h1>
      <form class="sbox" data-gsearch role="search">${icon('search')}<input name="q" type="search" value="${esc(q)}" placeholder="خدمة، مركز، معلم، مشروع…" aria-label="بحث موحد"/><button class="btn btn--primary" type="submit">بحث</button></form></header>
    ${res.total ? `<p class="count">${res.total} نتيجة في ${res.groups.length} ${res.groups.length === 1 ? 'قسم' : 'أقسام'}</p><div class="sgroups">${groupsHtml(res)}</div>`
      : `<div class="empty">${icon('search')}<h3>${q ? 'لا توجد نتائج مطابقة' : 'اكتب ما تبحث عنه'}</h3><p>${q ? 'جرّب كلمة أخرى، أو اسأل المساعد بصياغتك.' : 'ابحث بالعامية: «الميه قاطعة»، «آثار في شربين»، «مشروعات المنصورة».'}</p>${q ? `<button class="btn btn--primary" data-assistant="${esc(q)}">${icon('spark')} اسأل المساعد</button>` : ''}</div>`}`,
  };
}
