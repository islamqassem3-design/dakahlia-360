// Public ideas page: the simple original layout (roadmap + sector filter + idea cards),
// with two actions per idea: the printable project file and a working prototype.
// The development tools live in the team area (#/team), which is not in the site menu.
import { icon, esc, crumbs } from '../ui.js?v=202611261630';
import { sectorsIdeas, HORIZON } from '../data/ideas.js?v=202611261630';
import { allIdeas, suggestProto } from '../lib/innovation.js?v=202611261630';
import { isTeam } from '../lib/team.js?v=202611261630';

const tryLink = (i) => {
  if (i.link) return i.link;
  const t = suggestProto(i);
  return t === 'portal' ? '#/services' : t === 'map' ? '#/map' : `#/proto/${t}?idea=${i.id}`;
};

export function ideas(_, query) {
  const sec = query.get('s') || '';
  const hz = query.get('h') || '';
  const all = allIdeas().filter((i) => i.origin === 'catalog').map((i) => ({ ...i, sector: sectorsIdeas.find((s) => s.id === i.sector) }));
  const count = (h) => all.filter((i) => i.hz === h).length;
  return {
    title: 'أفكار للتطوير',
    html: `
    ${crumbs([['الدقهلية 360°', '#/'], ['أفكار للتطوير']])}
    <header class="phead"><p class="eyebrow">مقترحات للنقاش</p><h1 class="heading-3">أفكار لتطوير كل قطاع في المحافظة</h1>
      <p class="lead">${all.length} فكرة في ${sectorsIdeas.length} قطاعات. لكل فكرة: المشكلة التي تحلها، وكيف تعمل، وما تحتاجه لتبدأ، ومعها ملف مشروع ونموذج يمكن تجربته.</p></header>

    <div class="roadmap">${Object.entries(HORIZON).map(([k, v], n) => `
      <button class="rm ${hz === k ? 'on' : ''}" data-h="${k}"><span class="rm__n caption-3">0${n + 1}</span><b class="heading-5">${count(k)}</b><span class="title-3">أفكار ${v.t}</span><small class="caption-5">${v.d}</small></button>`).join('')}
    </div>

    <div class="filters ideas__f">
      <div class="fgroup" data-group="s"><span class="flabel">القطاع</span>
        <button class="fchip ${!sec ? 'on' : ''}" data-v="">الكل</button>
        ${sectorsIdeas.map((s) => `<button class="fchip ${sec === s.id ? 'on' : ''}" data-v="${s.id}">${s.title}</button>`).join('')}
      </div>
    </div>
    <p class="count" data-count></p>

    <div class="ideas">${all.map((i) => `
      <article class="idea" data-s="${i.sector.id}" data-hz="${i.hz}">
        <header class="idea__h"><span class="idea__ic">${icon(i.sector.icon)}</span><span class="caption-4 muted">${i.sector.title}</span><span class="hz hz--${i.hz}">${HORIZON[i.hz].t}</span></header>
        <h3 class="title-2">${esc(i.t)}</h3>
        <dl>
          <dt>المشكلة</dt><dd>${esc(i.p)}</dd>
          <dt>الفكرة</dt><dd>${esc(i.h)}</dd>
          <dt>تحتاج</dt><dd>${esc(i.n)}</dd>
        </dl>
        <div class="idea__foot">
          <a class="link" href="#/idea/${i.id}/proposal">${icon('clipboard')} ملف المشروع</a>
          <a class="link" href="${tryLink(i)}">جرّب النموذج ${icon('arrow')}</a>
        </div>
      </article>`).join('')}
    </div>
    <div class="note">${icon('info')}<span>هذه الأفكار تصور مبدئي من فريق النموذج، وتُرتب أولوياتها مع المحافظة والجهات المختصة حسب البيانات والصلاحيات المتاحة.</span></div>
    ${isTeam() ? `<p class="sim">${icon('kanban')} <span>وضع الفريق مفعّل في هذا المتصفح: <a href="#/team">افتح مساحة الفريق</a></span></p>` : ''}`,
    mount(root) {
      const st = { s: sec, h: hz };
      const cards = [...root.querySelectorAll('.idea')];
      const cnt = root.querySelector('[data-count]');
      const apply = () => {
        let n = 0;
        cards.forEach((c) => { const ok = (!st.s || c.dataset.s === st.s) && (!st.h || c.dataset.hz === st.h); c.hidden = !ok; n += ok; });
        cnt.textContent = `${n} فكرة`;
        root.querySelectorAll('[data-group="s"] [data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === st.s));
        root.querySelectorAll('.rm').forEach((b) => b.classList.toggle('on', b.dataset.h === st.h));
        const p = new URLSearchParams(); if (st.s) p.set('s', st.s); if (st.h) p.set('h', st.h);
        history.replaceState(null, '', '#/ideas' + (p.toString() ? '?' + p : ''));
      };
      root.addEventListener('click', (e) => {
        const v = e.target.closest('[data-group="s"] [data-v]'); if (v) { st.s = v.dataset.v; apply(); return; }
        const h = e.target.closest('.rm'); if (h) { st.h = st.h === h.dataset.h ? '' : h.dataset.h; apply(); }
      });
      apply();
    },
  };
}
