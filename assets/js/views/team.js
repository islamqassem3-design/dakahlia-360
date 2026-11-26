// Team area (#/team): the full ideas catalog with pipeline dashboard, sorting, board view and development tools.
import { icon, esc, crumbs } from '../ui.js?v=202611261625';
import { sectorsIdeas, HORIZON } from '../data/ideas.js?v=202611261625';
import { allIdeas, sectorById, SECTORS, STAGES, stageOf, setStage, evaluate, scoresOf, SIM_NOTE } from '../lib/innovation.js?v=202611261625';
import { setTeam } from '../lib/team.js?v=202611261625';

const SORTS = [['', 'الترتيب الافتراضي'], ['priority', 'الأولوية'], ['impact', 'التأثير على المواطن'], ['ease', 'سهولة التنفيذ'], ['quick', 'Quick Wins أولًا'], ['strategic', 'الاستراتيجية أولًا']];

const card = (i, ev, stage) => {
  const sec = sectorById[i.sector] || { title: '', icon: 'bulb' };
  return `
  <article class="idea" data-s="${i.sector}" data-hz="${i.hz}">
    <header class="idea__h"><span class="idea__ic">${icon(sec.icon)}</span><span class="caption-4 muted">${sec.title}</span><span class="hz hz--${i.hz}">${HORIZON[i.hz]?.t || ''}</span></header>
    <h3 class="title-2">${esc(i.t)}</h3>
    <div class="idea__meta"><span class="stg stg--${stage}">${STAGES.find((s) => s.id === stage).t}</span><span class="sc">${ev.total}/100</span>${ev.quick ? '<span class="qw">Quick Win</span>' : ''}${i.origin === 'lab' ? '<span class="caption-4 muted">من المعمل</span>' : ''}</div>
    <dl>
      <dt>المشكلة</dt><dd>${esc(i.p)}</dd>
      <dt>الفكرة</dt><dd>${esc(i.h)}</dd>
      <dt>تحتاج</dt><dd>${esc(i.n)}</dd>
    </dl>
    <div class="idea__foot">
      <a class="btn btn--dark btn--sm" href="#/idea/${i.id}">${icon('flask')} تطوير الفكرة</a>
      ${i.link ? `<a class="link" href="${i.link}">شاهدها في النموذج ${icon('arrow')}</a>` : ''}
    </div>
  </article>`;
};

export function team(_, query) {
  setTeam(true);
  const st = { s: query.get('s') || '', h: query.get('h') || '', sort: query.get('sort') || '', view: query.get('view') || 'cards' };
  const list = allIdeas();
  const count = (h) => list.filter((i) => i.hz === h).length;
  const usedSectors = SECTORS.filter((s) => list.some((i) => i.sector === s.id));
  return {
    title: 'مساحة الفريق',
    html: `
    ${crumbs([['أفكار للتطوير', '#/ideas'], ['مساحة الفريق']])}
    <header class="phead phead--row"><div><p class="eyebrow">داخلي · للفريق</p><h1 class="heading-3">مساحة الفريق</h1>
      <p class="lead">${list.length} فكرة. هنا نطوّر الأفكار ونقيّمها ونرتب أولوياتها ونبني نماذجها. هذه المساحة غير ظاهرة في قائمة الموقع، والزوار يرون صفحة الأفكار المبسطة.</p></div>
      <div class="row gap-75"><a class="btn btn--primary" href="#/lab">${icon('flask')} معمل الأفكار</a><a class="btn btn--ghost" href="#/studio">${icon('rocket')} استوديو النماذج</a><button class="btn btn--ghost" data-teamoff>${icon('no')} إنهاء وضع الفريق</button></div></header>

    <section class="pipe" aria-label="لوحة مسار التطوير" data-pipe></section>

    <div class="roadmap">${Object.entries(HORIZON).map(([k, v], n) => `
      <button class="rm ${st.h === k ? 'on' : ''}" data-h="${k}"><span class="rm__n caption-3">0${n + 1}</span><b class="heading-5">${count(k)}</b><span class="title-3">أفكار ${v.t}</span><small class="caption-5">${v.d}</small></button>`).join('')}
    </div>

    <div class="filters ideas__f">
      <div class="fgroup" data-group="s"><span class="flabel">القطاع</span>
        <button class="fchip ${!st.s ? 'on' : ''}" data-v="">الكل</button>
        ${usedSectors.map((s) => `<button class="fchip ${st.s === s.id ? 'on' : ''}" data-v="${s.id}">${s.title}</button>`).join('')}
      </div>
      <div class="frow">
        <label class="fselect"><span class="flabel">ترتيب حسب</span><select data-sort>${SORTS.map(([v, t]) => `<option value="${v}" ${st.sort === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>
        <div class="fgroup"><span class="flabel">العرض</span>
          <button class="fchip ${st.view === 'cards' ? 'on' : ''}" data-view="cards">${icon('grid')} بطاقات</button>
          <button class="fchip ${st.view === 'board' ? 'on' : ''}" data-view="board">${icon('kanban')} مسار التطوير</button>
        </div>
      </div>
    </div>
    <p class="count" data-count></p>
    <div data-list></div>
    <p class="sim">${icon('info')} <span>الدرجات والأولويات تقديرية: ${SIM_NOTE}</span></p>
    <div class="note">${icon('info')}<span>هذه الأفكار تصور مبدئي من فريق النموذج، وتُرتب أولوياتها مع المحافظة والجهات المختصة حسب البيانات والصلاحيات المتاحة.</span></div>`,
    mount(root) {
      const box = root.querySelector('[data-list]'); const cnt = root.querySelector('[data-count]'); const pipe = root.querySelector('[data-pipe]');
      const rows = () => list.map((i) => ({ i, ev: evaluate(i), sc: scoresOf(i), stage: stageOf(i.id) }));
      const draw = () => {
        const all = rows();
        const by = (s) => all.filter((r) => r.stage === s).length;
        pipe.innerHTML = [
          ['إجمالي الأفكار', all.length, ''], ['أفكار جديدة', by('idea'), 'idea'], ['قيد التطوير', by('dev'), 'dev'], ['لديها نموذج', by('proto'), 'proto'],
          ['جاهزة للعرض', by('ready'), 'ready'], ['أولوية عالية', all.filter((r) => r.ev.level === 'عالية').length, 'hi'], ['Quick Wins', all.filter((r) => r.ev.quick).length, 'qw'],
        ].map(([t, n, k]) => `<div class="pipe__i pipe__i--${k || 'all'}"><b class="heading-5">${n}</b><span class="caption-4">${t}</span></div>`).join('');
        let r = all.filter((x) => (!st.s || x.i.sector === st.s) && (!st.h || x.i.hz === st.h));
        const S = { priority: (a, b) => b.ev.total - a.ev.total, impact: (a, b) => b.sc.impact - a.sc.impact || b.ev.total - a.ev.total, ease: (a, b) => b.sc.ease - a.sc.ease || b.ev.total - a.ev.total,
          quick: (a, b) => (b.ev.quick - a.ev.quick) || b.ev.total - a.ev.total, strategic: (a, b) => (b.ev.strategic - a.ev.strategic) || (b.i.hz === 'long') - (a.i.hz === 'long') || b.ev.total - a.ev.total }[st.sort];
        if (S) r = [...r].sort(S);
        cnt.textContent = `${r.length} فكرة`;
        box.innerHTML = st.view === 'board'
          ? `<div class="board">${STAGES.map((s, n) => `<section class="col"><header><span class="caption-3">0${n + 1}</span><b class="title-3">${s.t}</b><small class="caption-5 muted">${r.filter((x) => x.stage === s.id).length}</small></header>
              ${r.filter((x) => x.stage === s.id).map((x) => `<article class="bc"><a class="title-4" href="#/idea/${x.i.id}">${esc(x.i.t)}</a><div class="idea__meta"><span class="sc">${x.ev.total}</span>${x.ev.quick ? '<span class="qw">QW</span>' : ''}<span class="caption-5 muted">${sectorById[x.i.sector]?.title || ''}</span></div>
                <div class="bc__mv">${n > 0 ? `<button class="iconbtn" data-move="${x.i.id}" data-to="${STAGES[n - 1].id}" aria-label="للمرحلة السابقة">${icon('next')}</button>` : '<span></span>'}${n < 3 ? `<button class="iconbtn" data-move="${x.i.id}" data-to="${STAGES[n + 1].id}" aria-label="للمرحلة التالية">${icon('arrow')}</button>` : ''}</div></article>`).join('') || '<p class="caption-5 muted col__e">لا توجد أفكار في هذه المرحلة</p>'}</section>`).join('')}</div>`
          : `<div class="ideas">${r.map((x) => card(x.i, x.ev, x.stage)).join('')}</div>`;
        root.querySelectorAll('[data-group="s"] [data-v]').forEach((b) => b.classList.toggle('on', b.dataset.v === st.s));
        root.querySelectorAll('.rm').forEach((b) => b.classList.toggle('on', b.dataset.h === st.h));
        root.querySelectorAll('[data-view]').forEach((b) => b.classList.toggle('on', b.dataset.view === st.view));
        const p = new URLSearchParams(); Object.entries(st).forEach(([k, v]) => v && !(k === 'view' && v === 'cards') && p.set(k, v));
        history.replaceState(null, '', '#/team' + (p.toString() ? '?' + p : ''));
      };
      root.addEventListener('click', (e) => {
        const v = e.target.closest('[data-group="s"] [data-v]'); if (v) { st.s = v.dataset.v; draw(); return; }
        const h = e.target.closest('.rm'); if (h) { st.h = st.h === h.dataset.h ? '' : h.dataset.h; draw(); return; }
        const vw = e.target.closest('[data-view]'); if (vw) { st.view = vw.dataset.view; draw(); return; }
        const mv = e.target.closest('[data-move]'); if (mv) { setStage(mv.dataset.move, mv.dataset.to); draw(); return; }
        if (e.target.closest('[data-teamoff]')) { setTeam(false); location.hash = '/ideas'; }
      });
      root.querySelector('[data-sort]').addEventListener('change', (e) => { st.sort = e.target.value; draw(); });
      draw();
    },
  };
}
