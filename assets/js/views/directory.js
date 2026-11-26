import { icon, esc, badge, serviceCard, crumbs, empty, sourceLink, sourceNote, agencyById } from '../ui.js?v=202611261625';
import { agencies, hotlines } from '../data/catalog.js?v=202611261625';
import { services } from '../data/services.js?v=202611261625';
import { places, PLACE_KIND } from '../data/places.js?v=202611261625';
import { sources, CHECKED_AT } from '../data/meta.js?v=202611261625';
import { faq } from '../data/faq.js?v=202611261625';
import { normalize } from '../lib/search.js?v=202611261625';
import { placeProjects, projectCard } from './map.js?v=202611261625';
import { projects as allProjects } from '../data/projects.js?v=202611261625';
const projectsOf = (agencyId) => allProjects.filter((p) => p.agency === agencyId);
import { placeDiscover, poiCard, sourceList } from './discover.js?v=202611261625';
import { discoverSources, SOURCE_KIND } from '../data/discover.js?v=202611261625';

const filterInput = (ph) => `<label class="finput">${icon('search')}<input type="search" placeholder="${ph}" data-filter aria-label="${ph}"/></label>`;
const liveFilter = (root) => {
  const inp = root.querySelector('[data-filter]'); if (!inp) return;
  const items = [...root.querySelectorAll('[data-name]')];
  const cnt = root.querySelector('[data-count]');
  const run = () => {
    const v = normalize(inp.value); let n = 0;
    items.forEach((el) => { const ok = !v || normalize(el.dataset.name).includes(v); el.hidden = !ok; n += ok; });
    if (cnt) cnt.textContent = n ? `${n} نتيجة` : 'لا توجد نتائج مطابقة';
  };
  inp.addEventListener('input', run);
};

export function agencyList(_, query) {
  const scope = query.get('scope') || '';
  const list = agencies.filter((a) => !scope || a.scope === scope);
  return {
    title: 'دليل الجهات',
    html: `
    ${crumbs([['الخدمات', '#/services'], ['دليل الجهات']])}
    <header class="phead"><h1>دليل الجهات</h1><p class="lead">الجهات والمديريات والمنصات الرسمية التي تقدم خدمات لسكان الدقهلية.</p></header>
    <div class="toolbar">${filterInput('ابحث باسم الجهة…')}
      <div class="fgroup">${[['', 'الكل'], ['local', 'داخل المحافظة'], ['national', 'جهات قومية']].map(([v, t]) => `<a class="fchip ${scope === v ? 'on' : ''}" href="#/agencies${v ? '?scope=' + v : ''}">${t}</a>`).join('')}</div>
    </div>
    <p class="count" data-count>${list.length} نتيجة</p>
    <div class="agrid">${list.map((a) => {
      const n = services.filter((s) => s.agency === a.id).length;
      return `<a class="agcard" href="#/agency/${a.id}" data-name="${esc(a.name + ' ' + a.type)}"><span class="pill">${esc(a.type)}</span><b>${esc(a.name)}</b><small>${a.scope === 'local' ? 'داخل المحافظة' : 'جهة قومية'}${n ? ` · ${n} ${n === 1 ? 'خدمة' : 'خدمات'}` : ''}</small></a>`;
    }).join('')}</div>`,
    mount: liveFilter,
  };
}

export function agencyDetail({ id }) {
  const a = agencyById[id];
  if (!a) return { title: 'غير موجود', html: empty('الجهة غير موجودة', 'ربما تغير الرابط.', '<a class="btn btn--primary" href="#/agencies">دليل الجهات</a>') };
  const list = services.filter((s) => s.agency === a.id || s.channels.some((c) => c.agency === a.id));
  return {
    title: a.name,
    html: `
    ${crumbs([['دليل الجهات', '#/agencies'], [a.name]])}
    <header class="phead"><span class="pill">${esc(a.type)} · ${a.scope === 'local' ? 'داخل المحافظة' : 'جهة قومية'}</span><h1>${esc(a.name)}</h1><p class="lead">${esc(a.about)}</p></header>
    <div class="info">
      <div class="info__i"><span>${icon('globe')} الموقع الرسمي</span>${sourceLink(a.source)}</div>
      <div class="info__i"><span>${icon('pin')} العنوان</span><b>غير متحقق منه حالياً</b></div>
      <div class="info__i"><span>${icon('phone')} أرقام التواصل</span><b>غير متحقق منها حالياً</b></div>
    </div>
    ${projectsOf(a.id).length ? `<section class="sec"><header class="sec__h sec__h--row"><h2>مشروعات تتولاها الجهة ${badge('demo')}</h2><a class="link" href="#/map">الخريطة ${icon('arrow')}</a></header><div class="pjgrid">${projectsOf(a.id).slice(0, 6).map(projectCard).join('')}</div></section>` : ''}
    <section class="sec"><header class="sec__h"><h2>خدمات مرتبطة بهذه الجهة</h2></header>
      ${list.length ? `<div class="slist">${list.map((s) => serviceCard(s)).join('')}</div>` : empty('لا توجد خدمات مفهرسة بعد', 'سيتم إضافة خدمات هذه الجهة بعد التحقق منها.')}
    </section>
    ${sourceNote(a.source)}`,
  };
}

export function placeList() {
  return {
    title: 'المراكز والمدن',
    html: `
    ${crumbs([['الخدمات', '#/services'], ['المراكز والمدن']])}
    <header class="phead"><h1>المراكز والمدن</h1><p class="lead">اختر مركزك لتصل للجهات والخدمات المحلية، ثم لمشروعاته ومعالمه في المراحل القادمة.</p></header>
    <div class="toolbar">${filterInput('ابحث باسم المركز أو المدينة…')}${badge('unverified', 'القائمة تُراجع مع الموقع الرسمي للمحافظة')}</div>
    <p class="count" data-count>${places.length} نتيجة</p>
    <div class="pgrid">${places.map((p) => `<a class="pcard ${p.capital ? 'pcard--cap' : ''}" href="#/place/${p.id}" data-name="${esc(p.name)}"><b>${p.name}</b><small>${PLACE_KIND[p.kind]}${p.capital ? ' · عاصمة المحافظة' : ''}</small>${icon('arrow')}</a>`).join('')}</div>`,
    mount: liveFilter,
  };
}

export function placeDetail({ id }) {
  const p = places.find((x) => x.id === id);
  if (!p) return { title: 'غير موجود', html: empty('المركز غير موجود', 'ربما تغير الرابط.', '<a class="btn btn--primary" href="#/places">كل المراكز</a>') };
  const localAgency = p.agency ? agencyById[p.agency] : null;
  const localSvcs = services.filter((s) => s.agency === 'local-units');
  const common = services.filter((s) => s.popular && s.agency !== 'local-units');
  const disc = placeDiscover(p.id);
  return {
    title: p.name,
    html: `
    ${crumbs([['المراكز والمدن', '#/places'], [p.name]])}
    ${disc.profile ? `<header class="cityhero" style="--bg:${disc.profile.tone};--ac:${disc.profile.accent}"><span class="city__tag">${PLACE_KIND[p.kind]} · ${disc.profile.tag}</span><h1>${p.name}</h1><p>${disc.profile.text}</p>
      <details class="cityhero__src"><summary>المصادر</summary>${sourceList(disc.profile.sources)}</details></header>`
    : `<header class="phead phero--place"><span class="pill">${PLACE_KIND[p.kind]}${p.capital ? ' · عاصمة المحافظة' : ''}</span><h1>${p.name}</h1>
      <p class="lead">كل ما يخص ${p.name} في مكان واحد: الجهة المحلية، الخدمات، المشروعات، والمعالم.</p></header>`}
    <nav class="tabs" aria-label="أقسام المركز">
      <button type="button" data-scroll="local">الجهة المحلية</button><button type="button" data-scroll="svcs">الخدمات</button><button type="button" data-scroll="projects">المشروعات</button><button type="button" data-scroll="discover">المعالم</button>
    </nav>
    <section class="sec" id="local"><header class="sec__h"><h2>الجهة المحلية الأقرب</h2></header>
      <div class="info">
        <div class="info__i"><span>${icon('building')} الجهة</span>${localAgency ? `<a href="#/agency/${localAgency.id}"><b>${esc(localAgency.name)}</b></a>` : `<b>الوحدة المحلية لمركز ومدينة ${p.name}</b>`}</div>
        <div class="info__i"><span>${icon('pin')} العنوان</span><b>غير متحقق منه حالياً</b></div>
        <div class="info__i"><span>${icon('phone')} التواصل</span><b>غير متحقق منه حالياً</b></div>
      </div>
    </section>
    <section class="sec" id="svcs"><header class="sec__h"><h2>خدمات تُقدَّم محليًا في ${p.name}</h2></header>
      <div class="slist">${localSvcs.map((s) => serviceCard(s)).join('')}</div>
    </section>
    <section class="sec"><header class="sec__h"><h2>خدمات شائعة متاحة لسكان المركز</h2></header>
      <div class="slist">${common.map((s) => serviceCard(s)).join('')}</div>
    </section>
    <section class="sec" id="projects"><header class="sec__h sec__h--row"><h2>مشروعات ${p.name} ${badge('demo')}</h2><a class="link" href="#/map?place=${p.id}">على الخريطة ${icon('arrow')}</a></header>
      ${placeProjects(p.id).length ? `<div class="pjgrid">${placeProjects(p.id).map(projectCard).join('')}</div>` : empty('لا توجد مشروعات معروضة', 'لم تُضف مشروعات لهذا المركز في النموذج بعد.')}
    </section>
    <section class="sec" id="discover"><header class="sec__h sec__h--row"><h2>معالم ${p.name}</h2><a class="link" href="#/discover">اكتشف الدقهلية ${icon('arrow')}</a></header>
      ${disc.pois.length ? `<div class="pois pois--row">${disc.pois.map(poiCard).join('')}</div>` : empty('المحتوى قيد التوثيق', `لم نضف معالم لـ${p.name} بعد؛ نضيف فقط ما له مصدر موثوق.`, '<a class="btn btn--ghost" href="#/discover">تصفح معالم المحافظة</a>')}
    </section>
    ${sourceNote('dakahlia')}`,
  };
}

const ISSUES = [
  { id: 'water', ic: 'water', t: 'مياه أو صرف صحي', d: 'انقطاع، كسر ماسورة، طفح صرف', ch: [['tel', '125', 'خدمة عملاء المياه والصرف']], svc: 'water' },
  { id: 'power', ic: 'bolt', t: 'كهرباء', d: 'انقطاع، عطل، خطر في الشارع', ch: [['tel', '121', 'طوارئ الكهرباء']], svc: 'electricity' },
  { id: 'urgent', ic: 'health', t: 'حالة طارئة', d: 'حادث، حريق، حالة صحية', ch: [['tel', '123', 'الإسعاف'], ['tel', '122', 'النجدة'], ['tel', '180', 'المطافئ']], svc: 'emergency' },
  { id: 'gov', ic: 'building', t: 'شكوى من جهة أو خدمة حكومية', d: 'تأخير، رفض، سوء معاملة، عدم رد', ch: [['web', 'shakwa', 'منظومة الشكاوى الحكومية الموحدة'], ['tel', '16528', 'الخط الساخن للمنظومة']], svc: 'complaint' },
  { id: 'street', ic: 'pin', t: 'مشكلة في الشارع أو الحي', d: 'نظافة، إشغالات، إنارة، مخالفات بناء', ch: [['web', 'shakwa', 'منظومة الشكاوى الحكومية الموحدة'], ['local', '', 'الوحدة المحلية التابع لها العنوان']], svc: 'complaint' },
];

export function complaints(_, query) {
  const sel = ISSUES.find((i) => i.id === query.get('t'));
  const chHtml = (c) => c[0] === 'tel' ? `<a class="chan" href="tel:${c[1]}"><span class="chan__ic">${icon('phone')}</span><span><b>${c[1]}: ${c[2]}</b><small>اضغط للاتصال</small></span></a>`
    : c[0] === 'web' ? `<a class="chan" href="${sources[c[1]].url}" target="_blank" rel="noopener"><span class="chan__ic">${icon('globe')}</span><span><b>${c[2]}</b><small>رابط رسمي تم فحصه · تقديم ومتابعة الشكوى</small></span>${icon('ext', 'chan__go')}</a>`
    : `<a class="chan" href="#/places"><span class="chan__ic">${icon('building')}</span><span><b>${c[2]}</b><small>اختر مركزك</small></span>${icon('arrow', 'chan__go')}</a>`;
  return {
    title: 'الشكاوى والاستفسارات',
    html: `
    ${crumbs([['الخدمات', '#/services'], ['الشكاوى والاستفسارات']])}
    <header class="phead"><h1>ما نوع مشكلتك؟</h1><p class="lead">اختر نوع المشكلة، ونرشدك للقناة الرسمية الصحيحة مباشرة.</p></header>
    <div class="issues" role="list">${ISSUES.map((i) => `<a role="listitem" class="issue ${sel?.id === i.id ? 'on' : ''}" href="#/complaints?t=${i.id}">${icon(i.ic)}<b>${i.t}</b><small>${i.d}</small></a>`).join('')}</div>
    ${sel ? `<section class="block result" id="result"><h2>${icon('check')} القناة المناسبة: ${sel.t}</h2><div class="chans">${sel.ch.map(chHtml).join('')}</div>
      <p class="hint">${icon('info')} البوابة لا تستقبل الشكاوى ولا تتابعها؛ التقديم والمتابعة يتمان عبر القناة الرسمية. <a href="#/service/${sel.svc}">تفاصيل الخدمة</a></p></section>`
      : `<div class="note">${icon('info')}<span>لماذا لا نستقبل الشكوى هنا؟ لأن التتبع الرسمي يتطلب ربطًا معتمدًا مع منظومة الشكاوى الحكومية، ولن ندّعي ربطًا غير موجود.</span></div>`}
    <section class="sec"><header class="sec__h sec__h--row"><h2>كل الخطوط الساخنة</h2>${badge('unverified', 'تُراجع مع المحافظة قبل الاعتماد')}</header>
      <div class="hotlines">${hotlines.map((h) => `<a class="hot" href="tel:${h.n}"><b>${h.n}</b><span>${h.label}</span></a>`).join('')}</div></section>`,
    mount(root) { if (sel) root.querySelector('#result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); },
  };
}

export function faqView() {
  return {
    title: 'الأسئلة الشائعة',
    html: `
    ${crumbs([['الخدمات', '#/services'], ['الأسئلة الشائعة']])}
    <header class="phead"><h1>الأسئلة الشائعة</h1><p class="lead">عن استخدام البوابة ومصادر معلوماتها.</p></header>
    <div class="faq">${faq.map((f, i) => `<details ${i === 0 ? 'open' : ''}><summary>${f.q}</summary><p>${f.a}${f.s ? ` <a href="#/service/${f.s}">افتح الخدمة</a>` : ''}</p></details>`).join('')}</div>
    <div class="note">${icon('spark')}<span>لم تجد إجابتك؟ <button class="linkbtn" data-assistant="">اسأل المساعد الذكي</button></span></div>`,
  };
}

export function dataPolicy() {
  return {
    title: 'مصادر البيانات',
    html: `
    ${crumbs([['الدقهلية 360°', '#/'], ['مصادر البيانات']])}
    <header class="phead"><h1>مصادر البيانات وسياسة الدقة</h1><p class="lead">الدقة أهم من كمية البيانات. هذه حالة كل مصدر مستخدم في النموذج.</p></header>
    <div class="legend">
      <div>${badge('verified')}<p>الرابط الرسمي استجاب عند الفحص بتاريخ ${CHECKED_AT}. المحتوى نفسه يُراجع مع الجهة.</p></div>
      <div>${badge('unverified')}<p>معلومة لم تتأكد بعد (عناوين، أرقام، مستندات، رسوم). لا تُنشر كحقيقة.</p></div>
      <div>${badge('demo')}<p>بيانات توضيحية لشكل الشاشة فقط، لا يُعتمد عليها.</p></div>
    </div>
    <div class="table" role="table" aria-label="المصادر">
      <div class="tr th" role="row"><span role="columnheader">المصدر</span><span role="columnheader">الرابط</span><span role="columnheader">الحالة</span></div>
      ${Object.values(sources).map((s) => `<div class="tr" role="row"><span role="cell">${s.name}${s.note ? `<small class="muted" style="display:block">${s.note}</small>` : ''}</span><a role="cell" href="${s.url}" target="_blank" rel="noopener" dir="ltr">${s.url.replace(/^https?:\/\//, '')}</a><span role="cell">${badge(s.status)}</span></div>`).join('')}
    </div>
    <h2 style="margin:28px 0 12px;font-size:20px">مصادر «اكتشف الدقهلية واستثمر»</h2>
    <div class="table" role="table" aria-label="مصادر الاكتشاف">
      <div class="tr th" role="row"><span role="columnheader">المصدر</span><span role="columnheader">الرابط</span><span role="columnheader">النوع</span></div>
      ${Object.values(discoverSources).map((s) => `<div class="tr" role="row"><span role="cell">${s.name}</span><a role="cell" href="${s.url}" target="_blank" rel="noopener" dir="ltr">${decodeURI(s.url).replace(/^https?:\/\//, '').slice(0, 48)}</a><span role="cell"><span class="badge ${s.kind === 'official' ? 'badge--ok' : 'badge--warn'}">${SOURCE_KIND[s.kind]}</span></span></div>`).join('')}
    </div>
    <div class="note">${icon('info')}<span>المحتوى الإرشادي في صفحات الخدمات صياغة تحريرية للوصول للقناة الصحيحة، ويُراجع ويُعتمد من الجهات المختصة قبل أي إطلاق رسمي.</span></div>`,
  };
}

