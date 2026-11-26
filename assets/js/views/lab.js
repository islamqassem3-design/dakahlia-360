// Idea Lab (#/lab): a structured workspace that feeds the existing ideas catalog. Not a chat window.
import { icon, esc, crumbs } from '../ui.js?v=202611261612';
import {
  LAB_SECTORS, sectorById, allIdeas, addIdea, generateIdeas, problemToIdeas, discoverOpportunities, IMPROVEMENTS,
  getIdea, val, saveWS, THEMES, allMergeSuggestions, SIM_NOTE, HORIZON, stageOf, setStage,
} from '../lib/innovation.js?v=202611261612';
import { aiChip } from '../aipanel.js?v=202611261612';
import { setTeam } from '../lib/team.js?v=202611261612';
import { aiOn, aiGenerate, aiProblem, aiOpps, aiMerge } from '../lib/ai.js?v=202611261612';
const HZ = (h) => (['quick', 'mid', 'long'].includes(h) ? h : 'mid');
const srcTag = (ai) => `<span class="srctag ${ai ? 'srctag--ai' : ''}">${ai ? 'من Gemini (AI حقيقي)' : 'محاكاة'}</span>`;

const TOOLS = [
  ['generate', 'توليد أفكار', 'bulb'], ['problem', 'من مشكلة إلى فكرة', 'warning'], ['improve', 'تطوير فكرة موجودة', 'edit'],
  ['merge', 'دمج أفكار', 'merge'], ['opps', 'اكتشاف الفرص', 'compass'],
];
const secSelect = (name, cur) => `<label class="fselect fselect--wide"><span class="flabel">القطاع</span><select data-f="${name}">${LAB_SECTORS.map((id) => `<option value="${id}" ${cur === id ? 'selected' : ''}>${sectorById[id].title}</option>`).join('')}</select></label>`;
const draftCard = (d, n) => `
  <article class="idea idea--draft" data-draft="${n}">
    <header class="idea__h"><span class="idea__ic">${icon(sectorById[d.sector]?.icon || 'bulb')}</span><span class="caption-4 muted">${sectorById[d.sector]?.title || ''}</span><span class="hz hz--${d.hz}">${HORIZON[d.hz].t}</span></header>
    <h3 class="title-2">${esc(d.t)}</h3>
    <dl><dt>المشكلة</dt><dd>${esc(d.p)}</dd><dt>الفكرة</dt><dd>${esc(d.h)}</dd><dt>تحتاج</dt><dd>${esc(d.n)}</dd></dl>
    <div class="idea__foot"><button class="btn btn--primary btn--sm" data-add="${n}">${icon('plus')} أضف للكتالوج</button></div>
  </article>`;

export function lab(_, query) {
  setTeam(true);
  const tool = query.get('tool') || 'generate';
  const sec = query.get('sector') || 'services';
  const ideas = allIdeas();
  let body = '';
  if (tool === 'generate') body = `<div class="labin">${secSelect('sector', sec)}<button class="btn btn--dark" data-run>${icon('bulb')} ولّد أفكارًا</button></div><div data-out></div>`;
  if (tool === 'problem') body = `<div class="labin labin--col"><label class="wf"><span class="wf__l title-4">اكتب المشكلة كما يراها المواطن</span><textarea data-f="problem" rows="3" placeholder="مثال: الزباله بتتجمع في الشارع ومحدش بييجي ياخدها في الميعاد"></textarea></label>
    <div class="labin">${secSelect('sector', '')}<button class="btn btn--dark" data-run>${icon('flask')} حلّل وحوّل لأفكار</button></div><p class="caption-5 muted">القطاع يُكتشف تلقائيًا من الكلمات إن لم تغيّره.</p></div><div data-out></div>`;
  if (tool === 'improve') body = `<div class="labin labin--col"><label class="fselect fselect--wide"><span class="flabel">الفكرة</span><select data-f="idea">${ideas.map((i) => `<option value="${i.id}" ${query.get('idea') === i.id ? 'selected' : ''}>${esc(i.t)}</option>`).join('')}</select></label>
    <div class="imprs">${IMPROVEMENTS.map((m, n) => `<label class="chk"><input type="checkbox" value="${n}"/><span><b class="title-4">${m.t}</b><small class="caption-5 muted">${m.v}</small></span></label>`).join('')}</div>
    <button class="btn btn--dark" data-run>${icon('ok')} طبّق على مساحة التطوير</button></div><div data-out></div>`;
  if (tool === 'merge') {
    const th = THEMES.find((t) => t.id === query.get('theme'));
    const pre = th ? new Set(ideas.filter((i) => th.match(i)).map((i) => i.id)) : new Set();
    body = `<div class="labin labin--col">
      <div class="row gap-75"><span class="caption-3">اقتراحات جاهزة:</span>${allMergeSuggestions().map((m) => `<a class="chip chip--btn" href="#/lab?tool=merge&theme=${m.id}">${m.name}</a>`).join('')}</div>
      <label class="wf"><span class="wf__l title-4">اسم المشروع الموحد</span><input class="inp" data-f="name" value="${esc(th?.name || '')}" placeholder="مثال: منظومة متابعة الطرق"/></label>
      <div class="pick">${ideas.map((i) => `<label class="chk"><input type="checkbox" value="${i.id}" ${pre.has(i.id) ? 'checked' : ''}/><span><b class="title-4">${esc(i.t)}</b><small class="caption-5 muted">${sectorById[i.sector]?.title || ''}</small></span></label>`).join('')}</div>
      <button class="btn btn--dark" data-run>${icon('merge')} اعرض تصور المشروع الموحد</button></div><div data-out></div>`;
  }
  if (tool === 'opps') body = `<div class="labin">${secSelect('sector', sec)}<button class="btn btn--dark" data-run>${icon('compass')} اكتشف الفرص</button></div><div data-out></div>`;

  return {
    title: 'معمل تطوير الأفكار',
    html: `
    ${crumbs([['مساحة الفريق', '#/team'], ['معمل تطوير الأفكار']])}
    <header class="phead"><p class="eyebrow">Idea Lab</p><h1 class="heading-3">معمل تطوير الأفكار</h1>
      <p class="lead">ولّد أفكارًا، حوّل مشكلة إلى حلول، طوّر فكرة، ادمج أفكارًا في مشروع، واكتشف الفرص في كل قطاع. كل نتيجة يمكن إضافتها لكتالوج الأفكار وتطويرها لاحقًا.</p></header>
    <div class="row gap-75">${aiChip()}</div>
    <p class="sim">${icon('info')} <span>${aiOn() ? 'عند تفعيل Gemini تُولَّد النتائج بذكاء اصطناعي حقيقي، وهي مقترحات تقديرية تحتاج مراجعتك. إذا تعذّر الاتصال تعود الأدوات للمحاكاة تلقائيًا.' : SIM_NOTE}</span></p>
    <nav class="wtabs">${TOOLS.map(([id, t, ic]) => `<a class="${tool === id ? 'on' : ''}" href="#/lab?tool=${id}">${icon(ic)} ${t}</a>`).join('')}</nav>
    <div class="wbody" data-tool="${tool}">${body}</div>`,
    mount(root) {
      const out = root.querySelector('[data-out]'); let drafts = [];
      const f = (k) => root.querySelector(`[data-f="${k}"]`);
      const showDrafts = (head = '') => { out.innerHTML = `${head}<div class="ideas">${drafts.map(draftCard).join('')}</div>`; };
      const runSim = () => {
        if (tool === 'generate') { drafts = generateIdeas(f('sector').value); showDrafts(`<p class="count">${drafts.length} أفكار مقترحة لقطاع ${sectorById[f('sector').value].title}</p>`); }
        if (tool === 'problem') {
          const t = f('problem').value.trim();
          if (t.length < 8) { out.innerHTML = '<p class="err">اكتب وصفًا أوضح للمشكلة (جملة كاملة على الأقل).</p>'; return; }
          const r = problemToIdeas(t, f('sector').value && f('sector').dataset.touched ? f('sector').value : null);
          drafts = r.ideas;
          showDrafts(`<div class="ana"><b class="title-3">تحليل المشكلة</b><dl><dt>القطاع المرجّح</dt><dd>${sectorById[r.sector].title}</dd><dt>المشكلة</dt><dd>${esc(t)}</dd><dt>اتجاهات الحل</dt><dd>${drafts.map((d) => d.t).join('، ')}</dd></dl></div>`);
        }
        if (tool === 'improve') {
          const id = f('idea').value; const idea = getIdea(id);
          const picked = [...root.querySelectorAll('.imprs input:checked')].map((c) => IMPROVEMENTS[+c.value]);
          if (!picked.length) { out.innerHTML = '<p class="err">اختر تحسينًا واحدًا على الأقل.</p>'; return; }
          picked.forEach((m) => { const cur = val(idea, m.k); if (!cur.includes(m.v)) saveWS(id, { [m.k]: `${cur}\n${m.v}`.trim() }); });
          if (stageOf(id) === 'idea') setStage(id, 'dev');
          out.innerHTML = `<div class="ana"><b class="title-3">${icon('ok')} تمت إضافة ${picked.length} تحسينات إلى «${esc(idea.t)}»</b><a class="btn btn--primary btn--sm" href="#/idea/${id}?tab=solution">افتح مساحة التطوير ${icon('arrow')}</a></div>`;
        }
        if (tool === 'merge') {
          const ids = [...root.querySelectorAll('.pick input:checked')].map((c) => c.value);
          if (ids.length < 2) { out.innerHTML = '<p class="err">اختر فكرتين على الأقل للدمج.</p>'; return; }
          const list = ids.map(getIdea); const name = f('name').value.trim() || `مشروع موحد: ${list[0].t}`;
          const th = THEMES.find((t) => t.id === new URLSearchParams(location.hash.split('?')[1]).get('theme'));
          const secs = [...new Set(list.map((i) => sectorById[i.sector]?.title))];
          out.innerHTML = `<article class="mg mg--big">
            <header><b class="title-1">${esc(name)}</b><span class="caption-4 muted">تصور مقترح، لم يُحفظ بعد</span></header>
            <p class="body-6"><b>الأفكار الداخلة:</b> ${list.map((i) => esc(i.t)).join('، ')}</p>
            <p class="body-6"><b>العلاقة بين الأفكار:</b> ${secs.length === 1 ? `كلها في قطاع ${secs[0]} وتخدم نفس المستخدم` : `تجمع قطاعات ${secs.join(' و')} حول نفس رحلة المواطن`}.</p>
            <p class="body-6"><b>المكونات الرئيسية:</b> ${(th?.parts || list.map((i) => i.t)).join('، ')}</p>
            <p class="body-6"><b>المشكلة:</b> ${esc(th?.problem || list.map((i) => i.p).join(' '))}</p>
            <p class="body-6"><b>القيمة الناتجة عن الدمج:</b> ${esc(th?.value || 'تشغيل واحد وبيانات مشتركة وتجربة موحدة بدل أدوات منفصلة.')}</p>
            <p class="body-6"><b>تصور المشروع بعد الدمج:</b> منصة واحدة بواجهة للمواطن ولوحة للجهة، تبدأ بنموذج تجريبي في مركز واحد.</p>
            <div class="row gap-75"><button class="btn btn--primary" data-create>${icon('ok')} أنشئ المشروع الموحد وأضفه للكتالوج</button></div></article>`;
          out.querySelector('[data-create]').onclick = () => {
            const rec = addIdea({ t: name, sector: list[0].sector, hz: 'mid', p: th?.problem || list[0].p, h: `دمج: ${list.map((i) => i.t).join('، ')}.`, n: [...new Set(list.map((i) => i.n))].join('، '), mergedFrom: ids });
            saveWS(rec.id, { stage: 'dev', components: (th?.parts || list.map((i) => i.t)).join('\n') });
            location.hash = `/idea/${rec.id}`;
          };
        }
        if (tool === 'opps') {
          const s = f('sector').value; const o = discoverOpportunities(s); const st = sectorById[s].title;
          const blk = (t, arr) => arr.length ? `<section class="opp"><h3 class="title-3">${t}</h3>${arr.map((x) => `<div class="opp__i"><span class="body-6">${esc(x)}</span><button class="linkbtn caption-4" data-opp="${esc(x)}" data-t="${t}">حوّلها لفكرة</button></div>`).join('')}</section>` : '';
          out.innerHTML = `<div class="opps2">
            ${blk('مشكلات غير معالجة', o.unmet)}${blk('خدمات غير متكاملة', o.gaps)}${blk('فرص التحول الرقمي', o.digital)}${blk('تحسين تجربة المواطن', o.cx)}
            <section class="opp"><h3 class="title-3">Quick Wins من الكتالوج</h3>${o.quick.map((i) => `<a class="opp__i" href="#/idea/${i.id}"><span class="body-6">${esc(i.t)}</span>${icon('arrow')}</a>`).join('') || '<p class="caption-5 muted">لا توجد بعد في هذا القطاع</p>'}</section>
            <section class="opp"><h3 class="title-3">فرص مشروعات استراتيجية</h3>${o.strategic.map((i) => `<a class="opp__i" href="#/idea/${i.id}"><span class="body-6">${esc(i.t)}</span>${icon('arrow')}</a>`).join('') || `<div class="opp__i"><span class="body-6">منظومة ${st} المتكاملة</span><button class="linkbtn caption-4" data-opp="منظومة ${st} المتكاملة" data-t="استراتيجية">حوّلها لفكرة</button></div>`}</section>
          </div>`;
          out.querySelectorAll('[data-opp]').forEach((b) => { b.onclick = () => {
            const rec = addIdea({ t: b.dataset.opp, sector: s, hz: b.dataset.t === 'استراتيجية' ? 'long' : b.dataset.t.includes('رقمي') ? 'mid' : 'quick', p: `${b.dataset.t} في قطاع ${st}.`, h: `${b.dataset.opp} ضمن قطاع ${st}.`, n: 'بيانات وتعاون من الجهة المختصة' });
            b.outerHTML = `<a class="link caption-4" href="#/idea/${rec.id}">أُضيفت · طوّرها ${icon('arrow')}</a>`;
          }; });
        }
        out.querySelectorAll('[data-add]').forEach((b) => { b.onclick = () => {
          const rec = addIdea(drafts[+b.dataset.add]);
          b.outerHTML = `<a class="btn btn--dark btn--sm" href="#/idea/${rec.id}">${icon('flask')} أُضيفت · طوّرها</a>`;
        }; });
      };
      const run = async () => {
        if (!aiOn() || tool === 'improve') return runSim();
        const btn = root.querySelector('[data-run]'); btn.disabled = true; const label = btn.innerHTML; btn.innerHTML = `${icon('spark')} جارٍ التفكير مع Gemini…`;
        const done = () => { btn.disabled = false; btn.innerHTML = label; };
        try {
          if (tool === 'generate') {
            const s = f('sector').value; const r = await aiGenerate(sectorById[s].title);
            drafts = (r.ideas || []).map((d) => ({ ...d, hz: HZ(d.hz), sector: s, n: d.n || 'يُحدد لاحقًا' }));
            showDrafts(`<p class="count">${drafts.length} أفكار لقطاع ${sectorById[s].title} ${srcTag(true)}</p>`);
          } else if (tool === 'problem') {
            const t = f('problem').value.trim(); if (t.length < 8) { done(); return runSim(); }
            const r = await aiProblem(t, LAB_SECTORS); const s = LAB_SECTORS.includes(r.sector) ? r.sector : 'services';
            drafts = (r.ideas || []).map((d) => ({ ...d, hz: HZ(d.hz), sector: s, p: d.p || t, n: d.n || 'يُحدد لاحقًا' }));
            showDrafts(`<div class="ana"><b class="title-3">تحليل المشكلة ${srcTag(true)}</b><dl><dt>القطاع المرجّح</dt><dd>${sectorById[s].title}</dd><dt>جوهر المشكلة</dt><dd>${esc(r.analysis?.core || t)}</dd><dt>المتضررون</dt><dd>${esc(r.analysis?.affected || '')}</dd><dt>أسباب محتملة</dt><dd>${esc(r.analysis?.causes || '')}</dd></dl></div>`);
          } else if (tool === 'opps') {
            const s = f('sector').value; const st = sectorById[s].title; const o = await aiOpps(st);
            const blk = (t, arr, hz) => (arr || []).length ? `<section class="opp"><h3 class="title-3">${t}</h3>${arr.map((x) => `<div class="opp__i"><span class="body-6">${esc(x)}</span><button class="linkbtn caption-4" data-opp="${esc(x)}" data-hz="${hz}" data-t="${t}">حوّلها لفكرة</button></div>`).join('')}</section>` : '';
            out.innerHTML = `<p class="count">فرص قطاع ${st} ${srcTag(true)}</p><div class="opps2">${blk('مشكلات غير معالجة', o.unmet, 'mid')}${blk('خدمات غير متكاملة', o.gaps, 'mid')}${blk('فرص التحول الرقمي', o.digital, 'mid')}${blk('تحسين تجربة المواطن', o.cx, 'quick')}${blk('Quick Wins', o.quick, 'quick')}${blk('فرص مشروعات استراتيجية', o.strategic, 'long')}</div>`;
            out.querySelectorAll('[data-opp]').forEach((b) => { b.onclick = () => {
              const rec = addIdea({ t: b.dataset.opp, sector: s, hz: b.dataset.hz, p: `${b.dataset.t} في قطاع ${st}.`, h: `${b.dataset.opp} ضمن قطاع ${st}.`, n: 'بيانات وتعاون من الجهة المختصة' });
              b.outerHTML = `<a class="link caption-4" href="#/idea/${rec.id}">أُضيفت · طوّرها ${icon('arrow')}</a>`;
            }; });
          } else if (tool === 'merge') {
            const ids = [...root.querySelectorAll('.pick input:checked')].map((c) => c.value);
            if (ids.length < 2) { done(); return runSim(); }
            const list = ids.map(getIdea); const r = await aiMerge(list); const name = f('name').value.trim() || r.name;
            out.innerHTML = `<article class="mg mg--big"><header><b class="title-1">${esc(name)}</b>${srcTag(true)}<span class="caption-4 muted">تصور مقترح، لم يُحفظ بعد</span></header>
              <p class="body-6"><b>الأفكار الداخلة:</b> ${list.map((i) => esc(i.t)).join('، ')}</p><p class="body-6"><b>العلاقة بين الأفكار:</b> ${esc(r.relation || '')}</p>
              <p class="body-6"><b>المكونات الرئيسية:</b> ${esc((r.parts || []).join('، '))}</p><p class="body-6"><b>المشكلة:</b> ${esc(r.problem || '')}</p>
              <p class="body-6"><b>القيمة الناتجة عن الدمج:</b> ${esc(r.value || '')}</p><p class="body-6"><b>تصور المشروع بعد الدمج:</b> ${esc(r.vision || '')}</p>
              <div class="row gap-75"><button class="btn btn--primary" data-create>${icon('ok')} أنشئ المشروع الموحد وأضفه للكتالوج</button></div></article>`;
            out.querySelector('[data-create]').onclick = () => {
              const rec = addIdea({ t: name, sector: list[0].sector, hz: 'mid', p: r.problem || list[0].p, h: r.vision || `دمج: ${list.map((i) => i.t).join('، ')}.`, n: [...new Set(list.map((i) => i.n))].join('، '), mergedFrom: ids });
              saveWS(rec.id, { stage: 'dev', components: (r.parts || []).join('\n'), solution: r.value || '' }); location.hash = `/idea/${rec.id}`;
            };
          }
          done();
          out.querySelectorAll('[data-add]').forEach((b) => { b.onclick = () => { const rec = addIdea(drafts[+b.dataset.add]); b.outerHTML = `<a class="btn btn--dark btn--sm" href="#/idea/${rec.id}">${icon('flask')} أُضيفت · طوّرها</a>`; }; });
        } catch (x) {
          done(); runSim();
          out.insertAdjacentHTML('afterbegin', `<p class="err">${esc(x.message)} عرضنا نتائج المحاكاة بدلًا منها.</p>`);
        }
      };
      root.querySelector('[data-run]')?.addEventListener('click', run);
      root.querySelector('select[data-f="sector"]')?.addEventListener('change', (e) => (e.target.dataset.touched = '1'));
      if (tool === 'merge' && query.get('theme')) runSim();
      void ideas;
    },
  };
}
