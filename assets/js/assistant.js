// Smart services assistant — a rule-based retrieval layer over the verified catalogue.
// It never generates procedures, fees or durations; it only returns catalogue entries and official links.
// Designed so a real LLM (with retrieval over the same data) can replace `answer()` later.
import { icon, esc, agencyById } from './ui.js';
import { sources } from './data/meta.js';
import { searchServices, searchAgencies, findPlaces, normalize } from './lib/search.js';
import { projects } from './data/projects.js';
import { pois } from './data/discover.js';

const has = (nq, words) => words.some((w) => nq.includes(normalize(w)));

export function answer(q) {
  const nq = normalize(q);
  if (!nq) return { text: 'اكتب ما تريد إنجازه بكلماتك، مثل: «عايز أجدد رخصة العربية» أو «الميه قاطعة عندنا».' };
  if (/^(السلام|سلام|اهلا|مرحبا|هاي|صباح|مساء)/.test(nq) && nq.split(' ').length <= 3)
    return { text: 'أهلًا بك! أنا مساعد بوابة خدمات الدقهلية. قل لي ما الذي تريد إنجازه، وسأرشدك للخدمة والجهة والقناة الرسمية.' };

  const emergency = has(nq, ['حريق', 'حادثه', 'اسعاف', 'طوارئ', 'نجده', 'مطافي', 'بيموت', 'نزيف']);
  const asksFee = has(nq, ['بكام', 'رسوم', 'سعر', 'تكلفه', 'تمن', 'كام جنيه', 'بفلوس']);
  const asksTime = has(nq, ['كام يوم', 'مده', 'وقت قد ايه', 'تاخد قد ايه', 'امتى تخلص', 'مواعيد']);
  const asksWhere = has(nq, ['فين', 'عنوان', 'مكان', 'رقم تليفون', 'رقمهم', 'نمرتهم', 'اتصل بيهم']);

  const res = searchServices(q);
  const plc = findPlaces(q);
  const ag = searchAgencies(q);
  const notes = [];

  if (emergency) {
    return { text: 'إذا كانت حالة طارئة اتصل فورًا:', calls: [['123', 'الإسعاف'], ['122', 'النجدة'], ['180', 'المطافئ']], services: res.slice(0, 1).map((r) => r.s).filter((s) => s.id !== 'emergency') };
  }
  if (asksFee) notes.push('لا تتوفر لدينا معلومة موثقة عن الرسوم حاليًا، لذلك لن أذكر أرقامًا. القيمة الرسمية تجدها لدى الجهة المختصة.');
  if (asksTime) notes.push('مدد التنفيذ ومواعيد العمل غير متحقق منها حالياً؛ راجع الجهة المختصة.');
  if (asksWhere) notes.push('العناوين وأرقام التواصل التفصيلية غير متحقق منها حالياً، لذلك أوجهك للقناة الرسمية.');

  if (has(nq, ['ارض صناعيه', 'منطقه صناعيه', 'فرص استثمار', 'فرصه استثمار', 'استثمر', 'استثمار', 'مستثمر'])) {
    return {
      text: 'للمستثمر: صفحة الاستثمار تعرض المقومات الموثقة ومسار الجهات الرسمية (الأرض، التأسيس، التراخيص). لا نعرض فرصًا إلا المؤكدة رسميًا، ولا توجد فرص مؤكدة معروضة حاليًا.',
      links: ['gafi'], mapLink: null, pageLink: ['#/invest', 'افتح صفحة الاستثمار'],
    };
  }
  if (has(nq, ['سياحه', 'سياحي', 'اخرج', 'فسحه', 'اتفسح', 'اماكن', 'اثار', 'اثري', 'مصيف', 'شاطئ', 'بحر', 'معالم', 'متحف', 'ازور'])) {
    const list = pois.filter((p) => !plc.length || plc.some((x) => x.id === p.place));
    return {
      text: list.length ? `هذه بعض المعالم ${plc.length ? 'في ' + plc.map((p) => p.name).join(' و') : 'في الدقهلية'}، وكل معلومة مرتبطة بمصدرها. مواعيد الزيارة والتذاكر غير متحقق منها حالياً.` : 'لم نوثّق معالم لهذه المنطقة بعد. تصفح معالم المحافظة:',
      pois: list.slice(0, 4), pageLink: ['#/discover', 'اكتشف الدقهلية'],
    };
  }
  if (has(nq, ['مشاريع', 'مشروعات']) || (plc.length && has(nq, ['مشروع', 'بيتعمل ايه']))) {
    const SEC = { water: ['مياه', 'ميه', 'صرف'], roads: ['طرق', 'طريق', 'كوبري', 'رصف'], health: ['صحه', 'مستشفي', 'وحده صحيه'], education: ['تعليم', 'مدارس', 'مدرسه'], electricity: ['كهرباء', 'كهربا', 'انارة'], youth: ['شباب', 'رياضه', 'ملعب'] };
    const sec = Object.keys(SEC).find((k) => has(nq, SEC[k]));
    const list = projects.filter((p) => (!plc.length || plc.some((x) => x.id === p.place)) && (!sec || p.sector === sec));
    const where = plc.length ? `في ${plc.map((p) => p.name).join(' و')}` : 'في المحافظة';
    const qs = new URLSearchParams(); if (plc.length === 1) qs.set('place', plc[0].id); if (sec) qs.set('sector', sec);
    return {
      text: `خريطة المشروعات تعرض ${list.length} مشروع ${where}. تنبيه: المشروعات الحالية بيانات تجريبية لعرض التجربة فقط.`,
      projects: list.slice(0, 4), mapLink: '#/map' + (qs.toString() ? '?' + qs : ''),
    };
  }

  const top = res[0];
  if (!top || top.score < 2.5) {
    if (ag.length) return { text: 'لم أحدد خدمة بعينها، لكن هذه الجهات قد تكون ما تبحث عنه:', agencies: ag.slice(0, 3), notes, places: plc };
    return {
      text: 'لم أجد خدمة موثقة تطابق طلبك في الدليل الحالي، ولن أخمّن إجراءً غير مؤكد.',
      notes: [...notes, 'جرّب صياغة أخرى، أو استخدم القناة الرسمية العامة:'],
      links: ['digital', 'shakwa'], places: plc,
    };
  }
  const confident = !res[1] || top.score >= res[1].score * 1.5;
  const picked = confident ? [top.s] : res.slice(0, 3).map((r) => r.s);
  return {
    text: confident ? 'فهمت طلبك. هذه الخدمة المناسبة:' : 'طلبك قد يقصد أكثر من خدمة، اختر الأقرب:',
    services: picked, primary: confident ? top.s : null, notes, places: plc,
  };
}

function renderAnswer(a) {
  let h = `<p>${esc(a.text)}</p>`;
  if (a.calls) h += `<div class="ai-calls">${a.calls.map(([n, l]) => `<a href="tel:${n}"><b>${n}</b> ${l}</a>`).join('')}</div>`;
  if (a.primary) {
    const s = a.primary; const ag = agencyById[s.agency];
    const on = s.channels.find((c) => c.kind === 'online'); const ph = s.channels.find((c) => c.kind === 'phone');
    h += `<div class="ai-card"><b>${esc(s.title)}</b><small>${esc(s.summary)}</small>
      <dl><dt>الجهة</dt><dd>${esc(ag.name)}</dd>${on ? `<dt>رسميًا</dt><dd><a href="${sources[on.source].url}" target="_blank" rel="noopener">${esc(on.label)} ${icon('ext')}</a></dd>` : ''}${ph ? `<dt>اتصال</dt><dd><a href="tel:${ph.number}">${ph.number}</a></dd>` : ''}<dt>المستندات</dt><dd>${s.docs?.status === 'demo' ? 'قائمة توضيحية (بيانات تجريبية)' : 'غير متحقق منها حالياً'}</dd></dl>
      <a class="btn btn--primary btn--sm" href="#/service/${s.id}" data-close>افتح تفاصيل الخدمة ${icon('arrow')}</a></div>`;
  } else if (a.services?.length) {
    h += `<div class="ai-list">${a.services.map((s) => `<a href="#/service/${s.id}" data-close>${esc(s.title)} ${icon('arrow')}</a>`).join('')}</div>`;
  }
  if (a.projects?.length) h += `<div class="ai-list">${a.projects.map((p) => `<a href="#/project/${p.id}" data-close>${esc(p.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.pois?.length) h += `<div class="ai-list">${a.pois.map((p) => `<a href="#/poi/${p.id}" data-close>${esc(p.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.pageLink) h += `<a class="btn btn--primary btn--sm" href="${a.pageLink[0]}" data-close>${a.pageLink[1]} ${icon('arrow')}</a>`;
  if (a.mapLink) h += `<a class="btn btn--primary btn--sm" href="${a.mapLink}" data-close>افتح خريطة المشروعات ${icon('arrow')}</a>`;
  if (a.agencies?.length) h += `<div class="ai-list">${a.agencies.map((g) => `<a href="#/agency/${g.id}" data-close>${esc(g.name)} ${icon('arrow')}</a>`).join('')}</div>`;
  if (a.notes?.length) h += a.notes.map((n) => `<p class="ai-note">${icon('shield')}<span>${esc(n)}</span></p>`).join('');
  if (a.links) h += `<div class="ai-list">${a.links.map((k) => `<a href="${sources[k].url}" target="_blank" rel="noopener">${sources[k].name} ${icon('ext')}</a>`).join('')}</div>`;
  if (a.places?.length) h += `<p class="ai-note">${icon('pin')}<span>صفحة ${a.places.map((p) => `<a href="#/place/${p.id}" data-close>${p.name}</a>`).join('، ')} تضم الجهة المحلية والخدمات هناك.</span></p>`;
  return h;
}

export function mountAssistant() {
  const el = document.createElement('div');
  el.innerHTML = `
  <button class="fab" data-assistant="" aria-label="افتح المساعد الذكي">${icon('spark')}<span>المساعد</span></button>
  <div class="ai" role="dialog" aria-modal="true" aria-labelledby="ai-t" hidden>
    <div class="ai__scrim" data-close></div>
    <section class="ai__panel">
      <header class="ai__h"><span class="ai__logo">${icon('spark')}</span><div><b id="ai-t">مساعد الخدمات</b><small>يفهم العامية · يجيب من الدليل الموثق فقط</small></div><button class="iconbtn" data-close aria-label="إغلاق">${icon('close')}</button></header>
      <div class="ai__log" aria-live="polite"></div>
      <div class="ai__sugg">${['عايز أطلع ترخيص لمحل', 'إيه المشروعات في ميت غمر؟', 'أماكن أخرج فيها في المنصورة', 'رخصة العربية بكام؟', 'الميه قاطعة في المنصورة', 'عايز أشتكي'].map((s) => `<button type="button" data-q="${s}">${s}</button>`).join('')}</div>
      <form class="ai__f"><input name="q" placeholder="اكتب سؤالك…" autocomplete="off" aria-label="سؤالك"/><button class="btn btn--primary" aria-label="إرسال">${icon('send')}</button></form>
      <p class="ai__disc">نموذج أولي: المعالجة داخل المتصفح فقط، ولا يُرسل ما تكتبه لأي خادم.</p>
    </section>
  </div>`;
  document.body.append(...el.children);
  const box = document.querySelector('.ai'); const log = box.querySelector('.ai__log'); const form = box.querySelector('.ai__f'); const inp = form.q;

  const push = (who, html) => {
    const m = document.createElement('div'); m.className = `msg msg--${who}`; m.innerHTML = html; log.append(m);
    log.scrollTop = log.scrollHeight;
  };
  const ask = (q) => {
    if (!q.trim()) return;
    push('me', esc(q));
    const t = document.createElement('div'); t.className = 'msg msg--bot typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.append(t); log.scrollTop = log.scrollHeight;
    setTimeout(() => { t.remove(); push('bot', renderAnswer(answer(q))); }, 380);
  };
  const open = (q = '') => {
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
