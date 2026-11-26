// Idea development workspace (#/idea/:id) and project proposal (#/idea/:id/proposal).
import { icon, esc, crumbs, empty, badge } from '../ui.js?v=202611261552';
import { projects } from '../data/projects.js?v=202611261552';
import {
  getIdea, getWS, saveWS, stageOf, setStage, STAGES, sectorById, CRITERIA, scoresOf, evaluate, val, draftFor,
  relatedIdeas, mergeSuggestionsFor, acceptMerge, decisions, decide, linkedProjects, linkProject, unlinkProject,
  suggestedProjectsFor, PROTO_TYPES, suggestProto, SIM_NOTE, HORIZON, IMPROVEMENTS,
} from '../lib/innovation.js?v=202611261552';
import { aiChip } from '../aipanel.js?v=202611261552';
import { aiOn, aiSection, aiScore } from '../lib/ai.js?v=202611261552';
const AI_NOTE = 'مقترحات Gemini (ذكاء اصطناعي حقيقي) تقديرية وتحتاج مراجعتك، ولا تُعد دراسة ميدانية.';

const SECTIONS = [
  { id: 'problem', t: 'تحليل المشكلة', icon: 'warning', fields: [
    ['problem', 'المشكلة'], ['current', 'الوضع الحالي'], ['causes', 'أسباب المشكلة', 'list'], ['gap', 'الفجوة الموجودة'],
    ['affected', 'الفئات المتضررة', 'list'], ['stakeholders', 'الجهات المرتبطة', 'list'], ['why', 'لماذا تحتاج المشكلة إلى تدخل؟']] },
  { id: 'solution', t: 'الحل المقترح', icon: 'bulb', fields: [
    ['solution', 'الحل المقترح'], ['how', 'كيف يعمل الحل؟'], ['usage', 'آلية الاستخدام'], ['components', 'مكونات الحل', 'list'],
    ['journey', 'رحلة المستخدم', 'list'], ['partners', 'جهات قد تشارك في التنفيذ', 'list']] },
  { id: 'project', t: 'تطوير المشروع', icon: 'rocket', fields: [
    ['pname', 'اسم المشروع المقترح'], ['pdesc', 'وصف المشروع'], ['goals', 'أهداف المشروع', 'list'], ['beneficiaries', 'المستفيدون', 'list'],
    ['reqs', 'المتطلبات', 'list'], ['phases', 'مراحل التنفيذ', 'list'], ['challenges', 'التحديات', 'list'], ['risks', 'المخاطر', 'list'], ['kpis', 'مؤشرات الأداء KPI', 'list']] },
  { id: 'impact', t: 'تحليل الأثر', icon: 'chart', fields: [
    ['cx_level', 'مستوى التحسين المتوقع للمواطن', 'level'], ['cx_notes', 'الأثر على المواطن: التجربة، الوقت، سهولة الوصول، تقليل الإجراءات'],
    ['gov_level', 'مستوى الأثر على الجهة', 'level'], ['gov_notes', 'الأثر الحكومي: الكفاءة، القرار، الرقابة، البيانات، الهدر']] },
  { id: 'score', t: 'التقييم والأولوية', icon: 'star' },
  { id: 'links', t: 'الروابط والدمج', icon: 'merge' },
];

const field = (idea, [k, label, type]) => {
  const v = val(idea, k); const edited = getWS(idea.id)[k] !== undefined;
  if (type === 'level') return `<label class="wf"><span class="wf__l title-4">${label}</span>
    <div class="seg" data-k="${k}">${['منخفض', 'متوسط', 'مرتفع'].map((o) => `<button type="button" class="${v === o ? 'on' : ''}" data-level="${o}">${o}</button>`).join('')}</div></label>`;
  return `<label class="wf"><span class="wf__l title-4">${label}${type === 'list' ? ' <small class="caption-5 muted">(بند في كل سطر)</small>' : ''}
    ${edited ? `<button type="button" class="wf__reset" data-reset="${k}" title="استرجاع المسودة">${icon('reset')}</button>` : '<span class="wf__draft caption-4">مسودة</span>'}</span>
    <textarea data-k="${k}" rows="${type === 'list' ? 4 : 3}">${esc(v)}</textarea></label>`;
};

function scorePanel(idea) {
  const sc = scoresOf(idea); const ev = evaluate(idea, sc);
  return `
  <div class="aibar"><button class="btn btn--dark btn--sm" data-ai-score>${icon('spark')} قيّم بالذكاء الاصطناعي</button><span class="caption-4 muted" data-ai-msg></span></div>
  <div class="score">
    <div class="score__sliders">${CRITERIA.map((c) => `
      <label class="sl"><span class="title-4">${c.t} <small class="caption-5 muted">${c.w}%</small></span>
        <input type="range" min="1" max="5" step="1" value="${sc[c.id]}" data-crit="${c.id}" aria-label="${c.t}"/><b class="sl__v">${sc[c.id]}/5</b></label>`).join('')}
    </div>
    <div class="score__out" data-score-out>${scoreOut(ev, getWS(idea.id).aiScore)}</div>
  </div>`;
}
const yes = (b) => (b ? `<span class="yn yn--y">${icon('ok')} نعم</span>` : `<span class="yn yn--n">${icon('no')} ليس بعد</span>`);
function scoreOut(ev, ai) {
  return `${ai ? `<div class="aisum"><b class="caption-3">${icon('spark')} تقييم Gemini</b><p class="body-6">${esc(ai.summary || '')}</p>${ai.reasons ? `<ul>${CRITERIA.map((c) => ai.reasons[c.id] ? `<li><b>${c.t}:</b> ${esc(ai.reasons[c.id])}</li>` : '').join('')}</ul>` : ''}</div>` : ''}
    <div class="score__total"><b class="heading-2">${ev.total}</b><span class="caption-3">/100</span><span class="prio prio--${ev.level === 'عالية' ? 'hi' : ev.level === 'متوسطة' ? 'md' : 'lo'}">أولوية ${ev.level}</span></div>
    <dl class="score__dl">
      <dt>سبب التقييم</dt><dd>${ev.reason}</dd>
      <dt>نقاط القوة</dt><dd>${ev.strengths.join('، ') || 'لا توجد معايير مرتفعة بعد'}</dd>
      <dt>نقاط الضعف</dt><dd>${ev.weak.join('، ') || 'لا توجد معايير منخفضة'}</dd>
      <dt>المخاطر</dt><dd>${ev.risks.join('، ') || 'غير محددة'}</dd>
      <dt>التوصية</dt><dd>${ev.rec}</dd>
      <dt>مدى المناسبة للبدء</dt><dd>${ev.readiness}</dd>
      <dt>تستحق Prototype؟</dt><dd>${yes(ev.protoWorthy)}</dd>
      <dt>Quick Win؟</dt><dd>${yes(ev.quick)}</dd>
    </dl>`;
}

function linksPanel(idea) {
  const rel = relatedIdeas(idea);
  const dec = decisions();
  const merges = mergeSuggestionsFor(idea).filter((m) => dec[`merge:${m.id}`] !== 'rejected');
  const linked = linkedProjects(idea.id);
  const sugg = suggestedProjectsFor(idea).filter((p) => !linked.includes(p));
  return `
  <div class="lk">
    <section><h3 class="title-2">${icon('link')} أفكار مرتبطة</h3>
      ${rel.length ? `<div class="rl">${rel.map((r) => `<a class="rl__i" href="#/idea/${r.x.id}"><span class="rl__k caption-3">${r.kind}</span><b class="title-4">${esc(r.x.t)}</b><small class="caption-5">${esc(r.why)}</small></a>`).join('')}</div>` : '<p class="muted body-6">لا توجد أفكار مرتبطة بدرجة كافية.</p>'}
    </section>
    <section><h3 class="title-2">${icon('merge')} اقتراحات الدمج <small class="caption-5 muted">اقتراح فقط، لا يُطبق تلقائيًا</small></h3>
      ${merges.length ? merges.map((m) => `
        <article class="mg">
          <header><b class="title-3">${m.name}</b>${dec[`merge:${m.id}`] === 'accepted' ? '<span class="hz hz--quick">تم قبوله</span>' : ''}</header>
          <p class="body-6"><b>المشكلة:</b> ${m.problem}</p>
          <p class="body-6"><b>الأفكار الداخلة:</b> ${m.ideas.map((i) => `<a href="#/idea/${i.id}">${esc(i.t)}</a>`).join('، ')}</p>
          <p class="body-6"><b>المكونات:</b> ${m.parts.join('، ')}</p>
          <p class="body-6"><b>قيمة الدمج:</b> ${m.value}</p>
          <div class="row gap-75">
            <button class="btn btn--primary btn--sm" data-merge="${m.id}">${icon('ok')} قبول وإنشاء المشروع الموحد</button>
            <a class="btn btn--ghost btn--sm" href="#/lab?tool=merge&theme=${m.id}">${icon('edit')} تعديل في المعمل</a>
            <button class="btn btn--ghost btn--sm" data-reject="${m.id}">${icon('no')} رفض</button>
          </div>
        </article>`).join('') : '<p class="muted body-6">لا توجد اقتراحات دمج لهذه الفكرة حاليًا.</p>'}
    </section>
    <section><h3 class="title-2">${icon('map')} مشروعات مرتبطة ${badge('demo')}</h3>
      ${linked.length ? `<div class="rl">${linked.map((p) => `<div class="rl__i"><a href="#/project/${p.id}"><b class="title-4">${esc(p.name)}</b></a><button class="linkbtn caption-4" data-unlink="${p.id}">فك الربط</button></div>`).join('')}</div>` : '<p class="muted body-6">لم تُربط مشروعات بعد.</p>'}
      ${sugg.length ? `<label class="fselect fselect--wide"><select data-linkp><option value="">اربط مشروعًا من نفس القطاع…</option>${sugg.map((p) => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>` : ''}
    </section>
  </div>`;
}

export function workspace({ id }, query) {
  const idea = getIdea(id);
  if (!idea) return { title: 'غير موجود', html: empty('الفكرة غير موجودة', 'ربما حُذفت من هذا المتصفح.', '<a class="btn btn--primary" href="#/ideas">أفكار للتطوير</a>') };
  const tab = query.get('tab') || 'problem';
  const sec = sectorById[idea.sector] || { title: '', icon: 'bulb' };
  const stage = stageOf(id); const ws = getWS(id); const ev = evaluate(idea);
  const proto = ws.proto ? PROTO_TYPES.find((p) => p.id === ws.proto) : null;
  return {
    title: idea.t,
    html: `
    ${crumbs([['أفكار للتطوير', '#/ideas'], [sec.title, `#/ideas?s=${idea.sector}`], [idea.t]])}
    <header class="wsh">
      <div class="wsh__t">
        <span class="idea__ic">${icon(sec.icon)}</span>
        <div><p class="caption-4 muted">${sec.title} · ${HORIZON[idea.hz]?.t || ''}${idea.origin === 'lab' ? ' · مضافة من المعمل' : ''}</p>
        <h1 class="heading-4">${esc(idea.t)}</h1></div>
      </div>
      <div class="wsh__act">
        ${aiChip()}
        <span class="prio prio--${ev.level === 'عالية' ? 'hi' : ev.level === 'متوسطة' ? 'md' : 'lo'}" data-score-chip>${ev.total}/100 · ${ev.level}</span>
        <a class="btn btn--ghost btn--sm" href="#/idea/${id}/proposal">${icon('clipboard')} ملف المشروع</a>
        <a class="btn btn--primary btn--sm" href="#/studio?idea=${id}">${icon('rocket')} ${proto ? 'فتح النموذج' : 'إنشاء نموذج'}</a>
        <button class="btn btn--ghost btn--sm" data-export>${icon('download')} تصدير</button>
      </div>
    </header>
    <ol class="stages" aria-label="مرحلة الفكرة">${STAGES.map((s, n) => `<li><button type="button" class="${s.id === stage ? 'on' : ''} ${STAGES.findIndex((x) => x.id === stage) > n ? 'done' : ''}" data-stage="${s.id}"><span class="caption-3">0${n + 1}</span>${s.t}</button></li>`).join('')}</ol>
    <p class="sim">${icon('info')} <span>${aiOn() ? AI_NOTE : SIM_NOTE} الحقول محفوظة في هذا المتصفح فقط <span data-saved class="caption-4"></span></span></p>
    <nav class="wtabs" role="tablist">${SECTIONS.map((s) => `<a role="tab" class="${s.id === tab ? 'on' : ''}" href="#/idea/${id}?tab=${s.id}">${icon(s.icon)} ${s.t}</a>`).join('')}</nav>
    <div class="wbody">
      ${tab === 'score' ? scorePanel(idea) : tab === 'links' ? linksPanel(idea)
        : `<div class="aibar"><button class="btn btn--dark btn--sm" data-ai-section>${icon('spark')} طوّر هذا القسم بالذكاء الاصطناعي</button><span class="caption-4 muted" data-ai-msg>${getWS(id).ai?.[tab] ? `آخر تطوير بالذكاء: ${getWS(id).ai[tab]}` : ''}</span></div>
           <div class="wgrid">${SECTIONS.find((s) => s.id === tab).fields.map((f) => field(idea, f)).join('')}</div>
           ${tab === 'solution' || tab === 'project' ? `<div class="impr"><span class="caption-3">تحسينات مقترحة (محاكاة)</span><div class="row gap-75">${IMPROVEMENTS.map((m, n) => `<button type="button" class="chip chip--btn" data-improve="${n}">${icon('plus')} ${m.t}</button>`).join('')}</div></div>` : ''}`}
    </div>
    <div class="wnext">${(() => { const i = SECTIONS.findIndex((s) => s.id === tab); const nx = SECTIONS[i + 1]; return nx ? `<a class="btn btn--dark" href="#/idea/${id}?tab=${nx.id}">التالي: ${nx.t} ${icon('arrow')}</a>` : `<a class="btn btn--dark" href="#/idea/${id}/proposal">${icon('clipboard')} عرض ملف المشروع</a>`; })()}</div>`,
    keepScroll: !!query.get('tab'),
    mount(root) {
      const savedEl = root.querySelector('[data-saved]');
      const mark = () => { savedEl.textContent = '· تم الحفظ'; clearTimeout(mark.t); mark.t = setTimeout(() => (savedEl.textContent = ''), 1600); };
      const bump = () => { if (stageOf(id) === 'idea') { setStage(id, 'dev'); root.querySelector('[data-stage="idea"]')?.classList.remove('on'); root.querySelector('[data-stage="dev"]')?.classList.add('on'); } };
      let tm;
      root.addEventListener('input', (e) => {
        const ta = e.target.closest('textarea[data-k]');
        if (ta) { clearTimeout(tm); tm = setTimeout(() => { saveWS(id, { [ta.dataset.k]: ta.value }); bump(); mark(); }, 350); return; }
        const r = e.target.closest('input[data-crit]');
        if (r) {
          const sc = { ...(getWS(id).scores || {}), [r.dataset.crit]: +r.value }; saveWS(id, { scores: sc }); mark();
          r.nextElementSibling.textContent = `${r.value}/5`;
          const ev2 = evaluate(idea); root.querySelector('[data-score-out]').innerHTML = scoreOut(ev2, getWS(id).aiScore);
          root.querySelector('[data-score-chip]').textContent = `${ev2.total}/100 · ${ev2.level}`;
        }
      });
      root.addEventListener('change', (e) => {
        const s = e.target.closest('select[data-linkp]'); if (s && s.value) { linkProject(id, s.value); dispatchEvent(new HashChangeEvent('hashchange')); }
      });
      const aiMsg = root.querySelector('[data-ai-msg]');
      const busy = (btn, on) => { btn.disabled = on; btn.classList.toggle('is-busy', on); if (on) aiMsg.textContent = 'جارٍ التفكير مع Gemini…'; };
      root.querySelector('[data-ai-section]')?.addEventListener('click', async (e) => {
        if (!aiOn()) { document.querySelector('.aichip')?.click(); return; }
        const btn = e.currentTarget; const fields = SECTIONS.find((s) => s.id === tab).fields;
        busy(btn, true);
        try {
          const r = await aiSection(idea, sec.title, fields, Object.fromEntries(fields.map(([k]) => [k, val(idea, k)])));
          const patch = {}; fields.forEach(([k, , t]) => { const v = r[k]; if (v == null) return; patch[k] = Array.isArray(v) ? v.join('\n') : t === 'level' && !['منخفض', 'متوسط', 'مرتفع'].includes(v) ? val(idea, k) : String(v); });
          saveWS(id, { ...patch, ai: { ...(getWS(id).ai || {}), [tab]: new Date().toISOString().slice(0, 10) } }); bump();
          dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (x) { busy(btn, false); aiMsg.textContent = `${x.message} (بقيت المسودة كما هي)`; }
      });
      root.querySelector('[data-ai-score]')?.addEventListener('click', async (e) => {
        if (!aiOn()) { document.querySelector('.aichip')?.click(); return; }
        const btn = e.currentTarget; busy(btn, true);
        try {
          const r = await aiScore(idea, sec.title, CRITERIA);
          const sc = {}; CRITERIA.forEach((c) => { const n = Math.round(+r.scores?.[c.id]); if (n >= 1 && n <= 5) sc[c.id] = n; });
          saveWS(id, { scores: { ...(getWS(id).scores || {}), ...sc }, aiScore: { summary: r.summary, reasons: r.reasons } });
          dispatchEvent(new HashChangeEvent('hashchange'));
        } catch (x) { busy(btn, false); aiMsg.textContent = x.message; }
      });
      root.addEventListener('click', (e) => {
        const st = e.target.closest('[data-stage]'); if (st) { setStage(id, st.dataset.stage); dispatchEvent(new HashChangeEvent('hashchange')); return; }
        const lv = e.target.closest('[data-level]'); if (lv) { const k = lv.parentElement.dataset.k; saveWS(id, { [k]: lv.dataset.level }); lv.parentElement.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b === lv)); bump(); mark(); return; }
        const rs = e.target.closest('[data-reset]'); if (rs) { const w = getWS(id); delete w[rs.dataset.reset]; const all = JSON.parse(localStorage.getItem('d360.ideas.ws') || '{}'); all[id] = w; localStorage.setItem('d360.ideas.ws', JSON.stringify(all)); dispatchEvent(new HashChangeEvent('hashchange')); return; }
        const im = e.target.closest('[data-improve]'); if (im) {
          const m = IMPROVEMENTS[+im.dataset.improve]; const cur = val(idea, m.k);
          if (!cur.includes(m.v)) saveWS(id, { [m.k]: `${cur}\n${m.v}`.trim() });
          bump(); mark(); im.classList.add('on'); im.disabled = true;
          const ta = root.querySelector(`textarea[data-k="${m.k}"]`); if (ta) ta.value = val(idea, m.k);
          return;
        }
        const mg = e.target.closest('[data-merge]'); if (mg) { const th = mergeSuggestionsFor(idea).find((m) => m.id === mg.dataset.merge); const rec = acceptMerge(th, th.ideas.map((i) => i.id)); location.hash = `/idea/${rec.id}`; return; }
        const rj = e.target.closest('[data-reject]'); if (rj) { decide(`merge:${rj.dataset.reject}`, 'rejected'); dispatchEvent(new HashChangeEvent('hashchange')); return; }
        const ul = e.target.closest('[data-unlink]'); if (ul) { unlinkProject(id, ul.dataset.unlink); dispatchEvent(new HashChangeEvent('hashchange')); return; }
        if (e.target.closest('[data-export]')) {
          const keys = SECTIONS.flatMap((s) => (s.fields || []).map((f) => f[0]));
          const data = { idea, stage: stageOf(id), evaluation: evaluate(idea), fields: Object.fromEntries(keys.map((k) => [k, val(idea, k)])), linkedProjects: linkedProjects(id).map((p) => p.id), note: SIM_NOTE };
          const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
          a.download = `${id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }
      });
    },
  };
}

const lines = (s) => String(s).split('\n').map((x) => x.trim()).filter(Boolean);
const ul = (s) => `<ul>${lines(s).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;

export function proposal({ id }) {
  const idea = getIdea(id);
  if (!idea) return { title: 'غير موجود', html: empty('الفكرة غير موجودة', '', '<a class="btn btn--primary" href="#/ideas">أفكار للتطوير</a>') };
  const v = (k) => val(idea, k); const ev = evaluate(idea); const sec = sectorById[idea.sector];
  const lp = linkedProjects(id);
  const S = (n, t, body) => `<section class="pp__s"><h2 class="heading-6"><span class="caption-3">${String(n).padStart(2, '0')}</span> ${t}</h2>${body}</section>`;
  return {
    title: `ملف مشروع: ${v('pname')}`,
    html: `
    ${crumbs([['أفكار للتطوير', '#/ideas'], [idea.t, `#/idea/${id}`], ['ملف المشروع']])}
    <div class="pp__bar noprint"><a class="btn btn--ghost btn--sm" href="#/idea/${id}">${icon('edit')} تعديل في مساحة التطوير</a><button class="btn btn--primary btn--sm" data-print>${icon('printer')} طباعة أو حفظ PDF</button></div>
    <article class="pp">
      <header class="pp__h"><p class="caption-3">Dakahlia 360° · مقترح مشروع · ${sec?.title || ''}</p><h1 class="heading-3">${esc(v('pname'))}</h1>
        <p class="caption-5 muted">مسودة للنقاش بتاريخ ${getWS(id).updated || new Date().toISOString().slice(0, 10)}. لا تتضمن أرقامًا غير موثقة؛ البيانات الكمية تُستكمل من الجهات المختصة.</p></header>
      ${S(1, 'الملخص التنفيذي', `<p>${esc(v('pdesc'))} يعالج المشروع: ${esc(v('problem'))} التقييم التقديري: ${ev.total}/100 (أولوية ${ev.level}).</p>`)}
      ${S(2, 'بيان المشكلة', `<p>${esc(v('problem'))}</p><p><b>الفجوة:</b> ${esc(v('gap'))}</p><p><b>الأسباب:</b></p>${ul(v('causes'))}`)}
      ${S(3, 'الوضع الحالي', `<p>${esc(v('current'))}</p>`)}
      ${S(4, 'الحل المقترح', `<p>${esc(v('solution'))}</p><p>${esc(v('how'))}</p>`)}
      ${S(5, 'الأهداف', ul(v('goals')))}
      ${S(6, 'الفئات المستفيدة', ul(v('beneficiaries')))}
      ${S(7, 'مكونات المشروع', ul(v('components')))}
      ${S(8, 'رحلة المستخدم', `<ol>${lines(v('journey')).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`)}
      ${S(9, 'منهجية التنفيذ', `<p>${esc(v('usage'))}</p>`)}
      ${S(10, 'مراحل التنفيذ', `<ol>${lines(v('phases')).map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`)}
      ${S(11, 'المتطلبات', ul(v('reqs')))}
      ${S(12, 'مؤشرات الأداء KPIs', `${ul(v('kpis'))}<p class="caption-5 muted">المستهدفات الرقمية تُحدد بعد قياس خط الأساس مع الجهة.</p>`)}
      ${S(13, 'الأثر المتوقع', `<p><b>على المواطن (${esc(v('cx_level'))}):</b> ${esc(v('cx_notes'))}</p><p><b>على الجهة (${esc(v('gov_level'))}):</b> ${esc(v('gov_notes'))}</p>`)}
      ${S(14, 'المخاطر والتحديات', `${ul(v('risks'))}${ul(v('challenges'))}`)}
      ${S(15, 'الجهات المعنية', ul(`${v('stakeholders')}\n${v('partners')}`.split('\n').filter((x, i, a) => x && a.indexOf(x) === i).join('\n')))}
      ${lp.length ? S(16, 'مشروعات مرتبطة على الخريطة (تجريبية)', ul(lp.map((p) => p.name).join('\n'))) : ''}
      ${S(lp.length ? 17 : 16, 'التوصية النهائية', `<p>${ev.rec} ${ev.quick ? 'تُصنف كمكسب سريع.' : ''} ${ev.protoWorthy ? 'يُقترح بناء نموذج تجريبي قبل التنفيذ الكامل.' : ''}</p><p class="caption-5 muted">${SIM_NOTE}</p>`)}
    </article>`,
    mount(root) { root.querySelector('[data-print]')?.addEventListener('click', () => print()); },
  };
}
