// Dakahlia 360° assistant (Phase 05): an AI layer built as verified retrieval over the platform data.
// • understands Egyptian colloquial phrasing (normalisation, stemming, synonyms)
// • routes intents: services, emergencies, projects, landmarks, investment, agencies
// • keeps conversation context (follow ups like «وفي جمصة؟») and page context (the service or place on screen)
// • cites the source behind every answer and never generates fees, durations or procedures
// Built so an LLM with retrieval over the same data can replace `answer()` without UI changes.
import { icon, esc, agencyById } from './ui.js?v=202611261622';
import { sources } from './data/meta.js?v=202611261622';
import { services } from './data/services.js?v=202611261622';
import { searchServices, searchAgencies, findPlaces, normalize, tokens } from './lib/search.js?v=202611261622';
import { globalSearch } from './lib/globalsearch.js?v=202611261622';
import { projects } from './data/projects.js?v=202611261622';
import { pois, discoverSources } from './data/discover.js?v=202611261622';
import { places } from './data/places.js?v=202611261622';

const has = (nq, words) => words.some((w) => nq.includes(normalize(w)));
const svcById = Object.fromEntries(services.map((s) => [s.id, s]));
const placeById = Object.fromEntries(places.map((p) => [p.id, p]));
const placeWords = new Set(places.flatMap((p) => tokens(p.name)));
const FILLER = new Set(tokens('و طب طيب في وفي بالنسبه ل ل لـ ايه عن طيب كمان برضه برده'));

const SEC = { water: ['مياه', 'ميه', 'صرف'], roads: ['طرق', 'طريق', 'كوبري', 'رصف'], health: ['صحه', 'مستشفي', 'وحده صحيه'], education: ['تعليم', 'مدارس', 'مدرسه'], electricity: ['كهرباء', 'كهربا', 'انارة'], youth: ['شباب', 'رياضه', 'ملعب'] };

// Page context: what is on screen right now.
export function pageContext() {
  const [path] = (location.hash.slice(1) || '/').split('?');
  const m = path.match(/^\/(service|place|project|poi|agency)\/([\w-]+)$/);
  return m ? { kind: m[1], id: m[2] } : { kind: path.replace(/^\//, '') || 'home' };
}

export function answer(q, ctx = {}) {
  const nq = normalize(q);
  if (!nq) return { kind: 'hello', text: 'اكتب ما تريد بكلماتك، مثل «عايز أجدد رخصة العربية» أو «فيه آثار في شربين؟»، وسأوجهك للخدمة أو المكان أو الجهة الصحيحة مع المصدر.' };
  if (/^(السلام|سلام|اهلا|مرحبا|هاي|صباح|مساء)/.test(nq) && nq.split(' ').length <= 3)
    return { kind: 'hello', text: 'أهلًا بك. أنا مساعد الدقهلية 360°. اسألني عن خدمة، أو مركز، أو معلم، أو مشروع، أو عن الاستثمار في المحافظة.' };

  const plc = findPlaces(q);

  // Follow up: «وفي جمصة؟» → repeat the last question for the new place.
  const rest = tokens(q).filter((t) => !placeWords.has(t) && !FILLER.has(t));
  if (plc.length && !rest.length && ctx.last?.q) {
    const prevPlaces = findPlaces(ctx.last.q).map((p) => p.name);
    let base = ctx.last.q; prevPlaces.forEach((n) => { base = base.replace(n, ''); });
    const a = answer(`${base} في ${plc[0].name}`, { ...ctx, last: null });
    return { ...a, followUp: plc[0].name };
  }

  const emergency = has(nq, ['حريق', 'حادثه', 'اسعاف', 'طوارئ', 'نجده', 'مطافي', 'بيموت', 'نزيف']);
  const asksFee = has(nq, ['بكام', 'رسوم', 'سعر', 'تكلفه', 'تمن', 'كام جنيه', 'بفلوس']);
  const asksTime = has(nq, ['كام يوم', 'مده', 'وقت قد ايه', 'تاخد قد ايه', 'امتى تخلص', 'مواعيد']);
  const asksWhere = has(nq, ['فين', 'عنوان', 'مكان', 'رقم تليفون', 'رقمهم', 'نمرتهم', 'اتصل بيهم', 'اقدم فين']);
  const asksDocs = has(nq, ['مستندات', 'اوراق', 'ورق', 'محتاج ايه', 'اجيب ايه', 'المطلوب']);
  const notes = [];
  if (asksFee) notes.push('لا توجد معلومة موثقة عن الرسوم حاليًا، لذلك لن أذكر أرقامًا. القيمة الرسمية لدى الجهة المختصة.');
  if (asksTime) notes.push('مدد التنفيذ ومواعيد العمل غير متحقق منها حاليًا. راجع الجهة المختصة.');
  if (asksWhere) notes.push('العناوين وأرقام التواصل التفصيلية غير متحقق منها حاليًا، لذلك أوجهك للقناة الرسمية.');

  if (emergency) return { kind: 'emergency', text: 'إذا كانت حالة طارئة اتصل فورًا:', calls: [['123', 'الإسعاف'], ['122', 'النجدة'], ['180', 'المطافئ']] };

  if (has(nq, ['ارض صناعيه', 'منطقه صناعيه', 'فرص استثمار', 'فرصه استثمار', 'استثمر', 'استثمار', 'مستثمر'])) {
    return {
      kind: 'invest',
      text: 'صفحة الاستثمار تعرض المقومات الموثقة ومسار الجهات الرسمية: الأرض، ثم التأسيس، ثم التراخيص. لا نعرض فرصة إلا إذا كانت معلنة رسميًا، ولا توجد فرص معلنة معروضة حاليًا.',
      pageLink: ['#/invest', 'افتح صفحة الاستثمار'], cites: [['gafi', 'meta'], ['madein', 'disc']],
    };
  }
  if (has(nq, ['سياحه', 'سياحي', 'اخرج', 'فسحه', 'اتفسح', 'اماكن', 'اثار', 'اثري', 'مصيف', 'شاطئ', 'بحر', 'معالم', 'متحف', 'ازور'])) {
    const list = pois.filter((p) => !plc.length || plc.some((x) => x.id === p.place));
    return {
      kind: 'pois', places: plc,
      text: list.length ? `هذه معالم ${plc.length ? 'في ' + plc.map((p) => p.name).join(' و') : 'في الدقهلية'}. مواعيد الزيارة والتذاكر غير متحقق منها حاليًا.` : `لم نوثّق معالم في ${plc.map((p) => p.name).join(' و')} بعد. نضيف فقط ما له مصدر موثوق.`,
      pois: list.slice(0, 4), pageLink: ['#/discover', 'اكتشف الدقهلية'],
      cites: list.slice(0, 1).flatMap((p) => p.sources.slice(0, 1).map((k) => [k, 'disc'])),
    };
  }
  if (has(nq, ['مشاريع', 'مشروعات']) || (plc.length && has(nq, ['مشروع', 'بيتعمل ايه']))) {
    const sec = Object.keys(SEC).find((k) => has(nq, SEC[k]));
    const list = projects.filter((p) => (!plc.length || plc.some((x) => x.id === p.place)) && (!sec || p.sector === sec));
    const where = plc.length ? `في ${plc.map((p) => p.name).join(' و')}` : 'في المحافظة';
    const qs = new URLSearchParams(); if (plc.length === 1) qs.set('place', plc[0].id); if (sec) qs.set('sector', sec);
    return {
      kind: 'projects', places: plc,
      text: `خريطة المشروعات تعرض ${list.length} مشروع ${where}. المشروعات الحالية بيانات تجريبية لعرض التجربة فقط.`,
      projects: list.slice(0, 4), mapLink: '#/map' + (qs.toString() ? '?' + qs : ''), demo: true,
    };
  }

  // Services, with page context as a tie breaker for short follow up questions.
  const res = searchServices(q);
  const top = res[0];
  const ctxSvc = ctx.page?.kind === 'service' ? svcById[ctx.page.id] : null;
  if ((!top || top.score < 2.5) && ctxSvc && (asksFee || asksTime || asksWhere || asksDocs)) {
    if (asksDocs) notes.push(ctxSvc.docs?.status === 'demo' ? 'قائمة المستندات في صفحة الخدمة توضيحية فقط (بيانات تجريبية).' : 'المستندات المطلوبة غير متحقق منها حاليًا. القائمة المعتمدة لدى الجهة.');
    return { kind: 'service', text: `بخصوص «${ctxSvc.title}»:`, primary: ctxSvc, services: [ctxSvc], notes, places: plc };
  }
  if (!top || top.score < 2.5) {
    const ag = searchAgencies(q);
    if (ag.length) return { kind: 'agencies', text: 'لم أحدد خدمة بعينها، لكن هذه الجهات قد تكون ما تبحث عنه:', agencies: ag.slice(0, 3), notes, places: plc };
    const g = globalSearch(q);
    if (g.total) return { kind: 'global', text: 'لم أجد خدمة مطابقة، لكن هذا ما وجدته في المنصة:', global: g.groups.slice(0, 3), notes, places: plc };
    return {
      kind: 'none', text: 'لم أجد معلومة موثقة تطابق طلبك، ولن أخمّن إجراءً غير مؤكد.',
      notes: [...notes, 'جرّب صياغة أخرى، أو استخدم القناة الرسمية العامة:'], links: ['digital', 'shakwa'], places: plc,
    };
  }
  if (asksDocs) notes.push(top.s.docs?.status === 'demo' ? 'قائمة المستندات في صفحة الخدمة توضيحية فقط (بيانات تجريبية).' : 'المستندات المطلوبة غير متحقق منها حاليًا. القائمة المعتمدة لدى الجهة.');
  const confident = !res[1] || top.score >= res[1].score * 1.5;
  return {
    kind: 'service',
    text: confident ? 'فهمت طلبك. هذه الخدمة المناسبة:' : 'طلبك قد يقصد أكثر من خدمة، اختر الأقرب:',
    services: confident ? [top.s] : res.slice(0, 3).map((r) => r.s), primary: confident ? top.s : null, notes, places: plc,
  };
}

const cite = ([k, kind]) => {
  const s = kind === 'disc' ? discoverSources[k] : sources[k];
  return s ? `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.name)}</a>` : '';
};

export function renderAnswer(a) {
  let h = a.followUp ? `<p class="ai-ctx">${icon('pin')} نفس السؤال عن ${esc(a.followUp)}</p>` : '';
  h += `<p>${esc(a.text)}</p>`;
  if (a.calls) h += `<div class="ai-calls">${a.calls.map(([n, l]) => `<a href="tel:${n}"><b>${n}</b> ${l}</a>`).join('')}</div>`;
  let cites = a.cites || [];
  if (a.primary) {
    const s = a.primary; const ag = agencyById[s.agency];
    const on = s.channels.find((c) => c.kind === 'online'); const ph = s.channels.find((c) => c.kind === 'phone');
    h += `<div class="ai-card"><b>${esc(s.title)}</b><small>${esc(s.summary)}</small>
      <dl><dt>الجهة</dt><dd>${esc(ag.name)}</dd>${on ? `<dt>رسميًا</dt><dd><a href="${sources[on.source].url}" target="_blank" rel="noopener">${esc(on.label)} ${icon('ext')}</a></dd>` : ''}${ph ? `<dt>اتصال</dt><dd><a href="tel:${ph.number}">${ph.number}</a></dd>` : ''}<dt>المستندات</dt><dd>${s.docs?.status === 'demo' ? 'قائمة توضيحية (بيانات تجريبية)' : 'غير متحقق منها حاليًا'}</dd></dl>
      <a class="btn btn--primary btn--sm" href="#/service/${s.id}" data-close>افتح تفاصيل الخدمة ${icon('arrow')}</a></div>`;
    cites = [[ag.source, 'meta'], ...(on && on.source !== ag.source ? [[on.source, 'meta']] : [])];
  } else if (a.services?.length) {
    h += `<div class="ai-list">${a.services.map((s) => `<a href="#/service/${s.id}" data-close>${esc(s.title)} ${icon('arrow')}</a>`).join('')}</div>`;
  }
  if (a.projects?.length) h += `<div class="ai-list">${a.projects.map((p) => `<a href="#/project/${p.id}" data-close>${esc(p.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.pois?.length) h += `<div class="ai-list">${a.pois.map((p) => `<a href="#/poi/${p.id}" data-close>${esc(p.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.global) h += a.global.map((g) => `<p class="ai-gt">${g.title}</p><div class="ai-list">${g.items.slice(0, 3).map((it) => `<a href="${it.href}" data-close>${esc(it.title)} ${icon('arrow')}</a>`).join('')}</div>`).join('');
  if (a.agencies?.length) h += `<div class="ai-list">${a.agencies.map((g) => `<a href="#/agency/${g.id}" data-close>${esc(g.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.pageLink) h += `<a class="btn btn--primary btn--sm" href="${a.pageLink[0]}" data-close>${a.pageLink[1]} ${icon('arrow')}</a>`;
  if (a.mapLink) h += `<a class="btn btn--primary btn--sm" href="${a.mapLink}" data-close>افتح خريطة المشروعات ${icon('arrow')}</a>`;
  if (a.notes?.length) h += a.notes.map((n) => `<p class="ai-note">${icon('shield')}<span>${esc(n)}</span></p>`).join('');
  if (a.links) h += `<div class="ai-list">${a.links.map((k) => `<a href="${sources[k].url}" target="_blank" rel="noopener">${sources[k].name} ${icon('ext')}</a>`).join('')}</div>`;
  if (a.places?.length && a.kind !== 'projects' && a.kind !== 'pois') h += `<p class="ai-note">${icon('pin')}<span>صفحة ${a.places.map((p) => `<a href="#/place/${p.id}" data-close>${p.name}</a>`).join('، ')} تضم الجهة المحلية والخدمات والمشروعات والمعالم.</span></p>`;
  const c = cites.map(cite).filter(Boolean);
  if (c.length) h += `<p class="ai-src">${icon('shield')}<span>المصدر: ${c.join(' · ')}</span></p>`;
  else if (a.demo) h += `<p class="ai-src ai-src--demo">${icon('info')}<span>المصدر: بيانات تجريبية، لا يوجد مصدر رسمي بعد</span></p>`;
  return h;
}

// Suggestions adapt to the page the user is on.
function suggestions(page) {
  if (page.kind === 'service' && svcById[page.id]) return ['فين أقدم؟', 'المستندات المطلوبة إيه؟', 'بكام؟', 'عايز أشتكي'];
  if (page.kind === 'place' && placeById[page.id]) { const n = placeById[page.id].name; return [`مشروعات ${n}`, `أماكن أخرج فيها في ${n}`, 'عايز أطلع ترخيص لمحل']; }
  if (page.kind === 'map' || page.kind === 'project') return ['مشروعات مياه', 'إيه المشروعات في ميت غمر؟', 'مشروعات حياة كريمة'];
  if (page.kind === 'discover' || page.kind === 'poi') return ['فيه آثار في شربين؟', 'أماكن أخرج فيها في المنصورة', 'عايز أستثمر'];
  if (page.kind === 'invest') return ['المنطقة الصناعية في جمصة', 'عايز أأسس شركة', 'السجل التجاري'];
  return ['عايز أطلع ترخيص لمحل', 'الميه قاطعة في المنصورة', 'إيه المشروعات في ميت غمر؟', 'أماكن أخرج فيها في المنصورة'];
}

export function mountAssistant() {
  const el = document.createElement('div');
  el.innerHTML = `
  <button class="fab" data-assistant="" aria-label="افتح المساعد الذكي">${icon('spark')}<span>المساعد</span></button>
  <div class="ai" role="dialog" aria-modal="true" aria-labelledby="ai-t" hidden>
    <div class="ai__scrim" data-close></div>
    <section class="ai__panel">
      <header class="ai__h"><span class="ai__logo">${icon('spark')}</span><div><b id="ai-t">مساعد الدقهلية 360°</b><small>يفهم العامية · يسترجع من بيانات المنصة الموثقة فقط</small></div><button class="iconbtn" data-close aria-label="إغلاق">${icon('close')}</button></header>
      <div class="ai__log" aria-live="polite"></div>
      <div class="ai__sugg"></div>
      <form class="ai__f"><input name="q" placeholder="اكتب سؤالك…" autocomplete="off" aria-label="سؤالك"/><button class="btn btn--primary" aria-label="إرسال">${icon('send')}</button></form>
      <p class="ai__disc">نموذج أولي: المعالجة داخل المتصفح فقط، ولا يُرسل ما تكتبه لأي خادم.</p>
    </section>
  </div>`;
  document.body.append(...el.children);
  const box = document.querySelector('.ai'); const log = box.querySelector('.ai__log'); const form = box.querySelector('.ai__f'); const inp = form.q;
  const sugg = box.querySelector('.ai__sugg');
  const ctx = { last: null, page: null };

  const push = (who, html) => {
    const m = document.createElement('div'); m.className = `msg msg--${who}`; m.innerHTML = html; log.append(m);
    log.scrollTop = log.scrollHeight;
  };
  const ask = (q) => {
    if (!q.trim()) return;
    push('me', esc(q));
    const t = document.createElement('div'); t.className = 'msg msg--bot typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.append(t); log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      t.remove(); const a = answer(q, ctx); push('bot', renderAnswer(a));
      if (!['hello', 'none', 'emergency'].includes(a.kind)) ctx.last = { q: a.followUp ? ctx.last?.q || q : q, kind: a.kind };
    }, 380);
  };
  const open = (q = '') => {
    ctx.page = pageContext();
    sugg.innerHTML = suggestions(ctx.page).map((s) => `<button type="button" data-q="${esc(s)}">${esc(s)}</button>`).join('');
    box.hidden = false; document.body.classList.add('noscroll');
    if (!log.children.length) push('bot', renderAnswer(answer('')));
    if (q) ask(q); setTimeout(() => inp.focus(), 50);
  };
  const close = () => { box.hidden = true; document.body.classList.remove('noscroll'); };

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-assistant]'); if (t) { e.preventDefault(); open(t.dataset.assistant); }
  });
  box.addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]'); if (q) return ask(q.dataset.q);
    if (e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = inp.value; inp.value = ''; ask(q); });
  return { open, close };
}
