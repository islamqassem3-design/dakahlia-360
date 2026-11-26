// Prototype Studio (#/studio?idea=) and interactive prototypes (#/proto/:type?idea=).
// All prototype data is DEMO data stored in this browser; nothing connects to a government system.
import { icon, esc, crumbs, empty, badge } from '../ui.js?v=202611261630';
import { services } from '../data/services.js?v=202611261630';
import { places } from '../data/places.js?v=202611261630';
import { projects, sectors as projSectors } from '../data/projects.js?v=202611261630';
import { loadLeaflet, baseMap } from './map.js?v=202611261630';
import { getIdea, getWS, saveWS, stageOf, setStage, PROTO_TYPES, suggestProto, linkedProjects, val, sectorById } from '../lib/innovation.js?v=202611261630';
import { isTeam } from '../lib/team.js?v=202611261630';

const DEMO = 'نموذج تجريبي ببيانات تجريبية للعرض فقط، ولا يتصل بأي نظام حكومي.';
const store = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const placeName = Object.fromEntries(places.map((p) => [p.id, p.name]));
const IDEA_TO_PROJ = { roads: ['roads'], utilities: ['water', 'electricity'], infra: ['water', 'electricity'], health: ['health'], education: ['education'], tourism: ['youth'] };

export function studio(_, query) {
  const id = query.get('idea'); const idea = id ? getIdea(id) : null;
  const sug = idea ? suggestProto(idea) : null; const cur = idea ? getWS(id).proto : null;
  return {
    title: 'استوديو النماذج',
    html: `
    ${crumbs([['مساحة الفريق', '#/team'], ...(idea ? [[idea.t, `#/idea/${id}`]] : []), ['استوديو النماذج']])}
    <header class="phead"><p class="eyebrow">Prototype Studio</p><h1 class="heading-3">${idea ? `نموذج تفاعلي لـ «${esc(idea.t)}»` : 'استوديو النماذج التجريبية'}</h1>
      <p class="lead">اختر نوع النموذج المناسب لطبيعة المشروع. ${idea ? `المقترح لهذه الفكرة: <b>${PROTO_TYPES.find((p) => p.id === sug).t}</b>.` : 'افتح الاستوديو من داخل أي فكرة لربط النموذج بها.'}</p></header>
    <div class="demo-banner">${icon('info')}<div><b>بيانات تجريبية</b><span>${DEMO}</span></div></div>
    <div class="ptypes">${PROTO_TYPES.map((p) => `
      <a class="ptype ${p.id === sug ? 'is-sug' : ''} ${p.id === cur ? 'is-cur' : ''}" href="#/proto/${p.id}${id ? `?idea=${id}` : ''}" data-ptype="${p.id}">
        <span class="ptype__ic">${icon(p.icon)}</span><b class="title-2">${p.t}</b><small class="body-6">${p.d}</small>
        ${p.id === cur ? '<span class="hz hz--quick">النموذج الحالي</span>' : p.id === sug ? '<span class="hz hz--mid">مقترح</span>' : ''}
      </a>`).join('')}</div>`,
    mount(root) {
      if (!id) return;
      root.addEventListener('click', (e) => { const a = e.target.closest('[data-ptype]'); if (!a) return;
        saveWS(id, { proto: a.dataset.ptype }); if (['idea', 'dev'].includes(stageOf(id))) setStage(id, 'proto'); });
    },
  };
}

const head = (type, idea, id) => {
  const t = PROTO_TYPES.find((p) => p.id === type);
  const lp = idea ? linkedProjects(id) : [];
  return `
  ${crumbs(isTeam() ? [['مساحة الفريق', '#/team'], ...(idea ? [[idea.t, `#/idea/${id}`]] : []), ['استوديو النماذج', `#/studio${id ? `?idea=${id}` : ''}`], [t.t]] : [['أفكار للتطوير', '#/ideas'], [t.t]])}
  <header class="phead phead--row"><div><p class="eyebrow">نموذج تفاعلي · ${t.t}</p><h1 class="heading-4">${idea ? esc(val(idea, 'pname')) : t.t}</h1></div>
    <div class="row gap-75">${idea && isTeam() ? `<a class="btn btn--ghost btn--sm" href="#/idea/${id}">${icon('flask')} الفكرة</a>` : ''}${idea ? `<a class="btn btn--ghost btn--sm" href="#/idea/${id}/proposal">${icon('clipboard')} ملف المشروع</a>` : ''}${isTeam() ? `<a class="btn btn--ghost btn--sm" href="#/studio${id ? `?idea=${id}` : ''}">${icon('grid')} نوع آخر</a>` : `<a class="btn btn--ghost btn--sm" href="#/ideas">${icon('next')} كل الأفكار</a>`}</div></header>
  <div class="demo-banner">${icon('info')}<div><b>نموذج تجريبي</b><span>${DEMO}</span></div></div>
  ${lp.length ? `<p class="sim">${icon('link')} <span>مرتبط بمشروعات: ${lp.map((p) => `<a href="#/project/${p.id}">${esc(p.name)}</a>`).join('، ')}</span></p>` : ''}`;
};

// ---------- booking ----------
function bookingUI(compact = false) {
  const svcs = services.filter((s) => s.popular || s.channels.some((c) => c.kind === 'office')).slice(0, 8);
  const days = []; const d = new Date(); while (days.length < 6) { d.setDate(d.getDate() + 1); if (d.getDay() !== 5) days.push(new Date(d)); }
  const fmt = (x) => x.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
  return `
  <div class="bk ${compact ? 'bk--c' : ''}" data-bk>
    <ol class="bk__steps">${['الخدمة', 'المركز', 'الموعد', 'البيانات', 'التأكيد'].map((s, n) => `<li data-step="${n}" class="${n ? '' : 'on'}">${s}</li>`).join('')}</ol>
    <section data-pane="0"><h3 class="title-2">اختر الخدمة</h3><div class="opts">${svcs.map((s) => `<button class="opt" data-pick="svc" data-v="${esc(s.title)}">${esc(s.title)}</button>`).join('')}</div></section>
    <section data-pane="1" hidden><h3 class="title-2">اختر المركز</h3><div class="opts">${places.slice(0, 12).map((p) => `<button class="opt" data-pick="place" data-v="${p.name}">${p.name}</button>`).join('')}</div></section>
    <section data-pane="2" hidden><h3 class="title-2">اختر اليوم والوقت</h3><div class="opts">${days.map((x) => `<button class="opt" data-pick="day" data-v="${fmt(x)}">${fmt(x)}</button>`).join('')}</div>
      <div class="opts opts--slots">${['9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'].map((t) => `<button class="opt" data-pick="time" data-v="${t}">${t}</button>`).join('')}</div><button class="btn btn--primary" data-next hidden>متابعة ${icon('arrow')}</button></section>
    <section data-pane="3" hidden><h3 class="title-2">بيانات تجريبية</h3><p class="caption-5 muted">لا تكتب بيانات حقيقية. لا يُرسل شيء لأي جهة.</p>
      <label class="wf"><span class="wf__l title-4">الاسم</span><input class="inp" data-in="name" placeholder="مثال: أحمد محمود (تجريبي)"/></label>
      <label class="wf"><span class="wf__l title-4">رقم موبايل تجريبي</span><input class="inp" data-in="phone" inputmode="numeric" dir="ltr" placeholder="01000000000"/></label>
      <p class="err" data-err hidden></p><button class="btn btn--primary" data-confirm>${icon('calendar')} تأكيد الحجز التجريبي</button></section>
    <section data-pane="4" hidden><div class="done"><span class="done__ic">${icon('ok')}</span><h3 class="heading-5">تم الحجز التجريبي</h3><p class="body-6" data-sum></p><b class="ref" data-ref></b></div></section>
    <section class="bk__mine"><h3 class="title-3">${icon('clipboard')} حجوزاتي التجريبية</h3><div data-mine></div></section>
  </div>`;
}
function bookingMount(root) {
  const el = root.querySelector('[data-bk]'); if (!el) return;
  const st = {}; let step = 0; const K = 'd360.proto.bookings';
  const go = (n) => { step = n; el.querySelectorAll('[data-pane]').forEach((p) => (p.hidden = +p.dataset.pane !== n)); el.querySelectorAll('[data-step]').forEach((s) => { s.classList.toggle('on', +s.dataset.step === n); s.classList.toggle('done', +s.dataset.step < n); }); };
  const mine = () => { const l = store(K, []); el.querySelector('[data-mine]').innerHTML = l.length ? l.slice().reverse().map((b) => `<div class="mine"><b class="title-4">${esc(b.svc)}</b><small class="caption-5">${esc(b.place)} · ${esc(b.day)} ${esc(b.time)} · ${b.ref}</small><button class="linkbtn caption-4" data-cancel="${b.ref}">إلغاء</button></div>`).join('') : '<p class="caption-5 muted">لا توجد حجوزات بعد.</p>'; };
  el.addEventListener('click', (e) => {
    const p = e.target.closest('[data-pick]');
    if (p) { st[p.dataset.pick] = p.dataset.v; p.parentElement.querySelectorAll('.opt').forEach((o) => o.classList.toggle('on', o === p));
      if (p.dataset.pick === 'svc') go(1); else if (p.dataset.pick === 'place') go(2); else el.querySelector('[data-next]').hidden = !(st.day && st.time); return; }
    if (e.target.closest('[data-next]')) { go(3); return; }
    if (e.target.closest('[data-step]')) { const n = +e.target.closest('[data-step]').dataset.step; if (n < step && n < 4) go(n); return; }
    if (e.target.closest('[data-confirm]')) {
      const name = el.querySelector('[data-in="name"]').value.trim(); const phone = el.querySelector('[data-in="phone"]').value.trim(); const err = el.querySelector('[data-err]');
      if (name.length < 3) { err.hidden = false; err.textContent = 'اكتب اسمًا تجريبيًا من 3 أحرف على الأقل.'; return; }
      if (!/^01[0125]\d{8}$/.test(phone)) { err.hidden = false; err.textContent = 'رقم الموبايل يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015.'; return; }
      err.hidden = true; const ref = `DEMO-${(Date.now() % 100000).toString().padStart(5, '0')}`;
      const l = store(K, []); l.push({ ...st, ref }); put(K, l);
      el.querySelector('[data-sum]').textContent = `${st.svc} · ${st.place} · ${st.day} الساعة ${st.time}. ستصلك رسالة تذكير بالمستندات (محاكاة).`;
      el.querySelector('[data-ref]').textContent = `رقم الحجز: ${ref}`; go(4); mine(); return;
    }
    const c = e.target.closest('[data-cancel]'); if (c) { put(K, store(K, []).filter((b) => b.ref !== c.dataset.cancel)); mine(); }
  });
  mine();
}

// ---------- tracking ----------
const STAGE_T = ['الدراسة', 'الطرح', 'التنفيذ', 'التسليم'];
const trackRows = (idea) => {
  const secs = idea ? IDEA_TO_PROJ[idea.sector] : null;
  return projects.filter((p) => !secs || secs.includes(p.sector)).map((p) => {
    const st = { planned: 1, ongoing: 2, done: 4 }[p.status];
    const prog = p.status === 'done' ? 100 : p.status === 'planned' ? 0 : 20 + (hash(p.id) % 60);
    return { ...p, st, prog };
  });
};
function trackingUI(idea) {
  const rows = trackRows(idea);
  return `
  <div class="tk" data-tk>
    <div class="tk__bar"><label class="finput">${icon('search')}<input type="search" data-q placeholder="ابحث باسم المشروع أو المركز"/></label>
      <div class="fgroup">${[['', 'الكل'], ['planned', 'مخطط'], ['ongoing', 'جاري'], ['done', 'مكتمل']].map(([v, t]) => `<button class="fchip ${v ? '' : 'on'}" data-st="${v}">${t}</button>`).join('')}</div></div>
    <div class="tk__grid"><div class="tk__list" data-list>${rows.map((r) => `
      <button class="tkc" data-id="${r.id}" data-s="${r.status}" data-n="${esc(r.name + ' ' + placeName[r.place])}"><b class="title-4">${esc(r.name)}</b><small class="caption-5 muted">${placeName[r.place]} · ${projSectors.find((s) => s.id === r.sector).title}</small>
        <span class="bar"><i style="width:${r.prog}%"></i></span><small class="caption-4">${r.prog}% (تجريبي)</small></button>`).join('')}</div>
      <div class="tk__side"><div class="tk__map" id="tkmap"></div><div class="tk__det" data-det><p class="caption-5 muted">اختر مشروعًا لعرض مراحله.</p></div></div></div>
  </div>`;
}
async function trackingMount(root, idea) {
  const el = root.querySelector('[data-tk]'); if (!el) return;
  const rows = trackRows(idea); const det = el.querySelector('[data-det]'); let map, L, mk = {};
  const st = { q: '', s: '' };
  const filter = () => { const q = st.q; el.querySelectorAll('.tkc').forEach((c) => { c.hidden = !((!st.s || c.dataset.s === st.s) && (!q || c.dataset.n.includes(q))); }); };
  const show = (id) => {
    const r = rows.find((x) => x.id === id);
    el.querySelectorAll('.tkc').forEach((c) => c.classList.toggle('on', c.dataset.id === id));
    det.innerHTML = `<b class="title-2">${esc(r.name)}</b><small class="caption-5 muted">${placeName[r.place]} ${badge('demo')}</small>
      <ol class="tl">${STAGE_T.map((t, n) => `<li class="${n < r.st ? 'done' : n === r.st ? 'now' : ''}"><span>${t}</span></li>`).join('')}</ol>
      <div class="bar bar--lg"><i style="width:${r.prog}%"></i></div><p class="caption-4">نسبة الإنجاز التجريبية: ${r.prog}%</p>
      <p class="body-6"><b>آخر تحديث:</b> ${r.updated} (تجريبي)</p><a class="link" href="#/project/${r.id}">صفحة المشروع ${icon('arrow')}</a>`;
    if (map && mk[id]) { map.setView(mk[id].getLatLng(), 11); mk[id].openPopup(); }
  };
  el.addEventListener('click', (e) => {
    const c = e.target.closest('.tkc'); if (c) return show(c.dataset.id);
    const s = e.target.closest('[data-st]'); if (s) { st.s = s.dataset.st; el.querySelectorAll('[data-st]').forEach((b) => b.classList.toggle('on', b === s)); filter(); }
  });
  el.querySelector('[data-q]').addEventListener('input', (e) => { st.q = e.target.value.trim(); filter(); });
  try {
    L = await loadLeaflet(); const m = el.querySelector('#tkmap'); if (!m) return;
    map = baseMap(L, m, { scroll: false });
    if (rows.length) map.fitBounds(L.latLngBounds(rows.map((r) => [r.lat, r.lng])).pad(0.15), { animate: false }); else map.setView([31.05, 31.55], 9);
    rows.forEach((r) => { mk[r.id] = L.circleMarker([r.lat, r.lng], { radius: 7, color: '#fff', weight: 2, fillColor: r.status === 'done' ? '#3f6b1f' : r.status === 'ongoing' ? '#ff6b1a' : '#2b3420', fillOpacity: 1 }).bindPopup(`<div class="mpop"><b>${esc(r.name)}</b><small>${r.prog}% (تجريبي)</small></div>`).on('click', () => show(r.id)).addTo(map); });
  } catch { el.querySelector('#tkmap').innerHTML = '<div class="maperr"><p>تعذّر تحميل الخريطة.</p></div>'; }
}

// ---------- reporting ----------
const CATS = ['نظافة ومخلفات', 'إنارة', 'حفر في الطريق', 'مياه', 'صرف صحي', 'إشغالات'];
const RS = ['تم الاستلام', 'قيد المعالجة', 'تم الحل'];
function reportingUI(compact = false) {
  return `
  <div class="rp ${compact ? 'rp--c' : ''}" data-rp>
    <form class="rp__f" novalidate>
      <h3 class="title-2">${icon('warning')} بلاغ جديد (تجريبي)</h3>
      <div class="opts">${CATS.map((c) => `<button type="button" class="opt" data-cat="${c}">${c}</button>`).join('')}</div>
      <label class="fselect fselect--wide"><select data-place><option value="">اختر المركز…</option>${places.map((p) => `<option>${p.name}</option>`).join('')}</select></label>
      <label class="wf"><span class="wf__l title-4">الوصف</span><textarea rows="3" data-desc placeholder="مثال: عمود إنارة لا يعمل أمام المدرسة"></textarea></label>
      <p class="err" data-err hidden></p>
      <button class="btn btn--primary" type="submit">${icon('send')} إرسال البلاغ التجريبي</button>
    </form>
    <section class="rp__list"><h3 class="title-3">بلاغاتي التجريبية</h3><div data-list></div></section>
  </div>`;
}
function reportingMount(root) {
  const el = root.querySelector('[data-rp]'); if (!el) return;
  const K = 'd360.proto.reports'; let cat = '';
  const list = () => { const l = store(K, []); el.querySelector('[data-list]').innerHTML = l.length ? l.slice().reverse().map((r) => `
    <div class="mine"><b class="title-4">${esc(r.cat)} · ${esc(r.place)}</b><small class="caption-5">${esc(r.desc)}</small>
      <ol class="tl tl--s">${RS.map((s, n) => `<li class="${n < r.s ? 'done' : n === r.s ? 'now' : ''}"><span>${s}</span></li>`).join('')}</ol>
      <div class="row gap-75"><span class="caption-4">${r.ref}</span>${r.s < 2 ? `<button class="linkbtn caption-4" data-adv="${r.ref}">محاكاة تحديث الحالة</button>` : ''}</div></div>`).join('') : '<p class="caption-5 muted">لا توجد بلاغات بعد.</p>'; };
  el.addEventListener('click', (e) => {
    const c = e.target.closest('[data-cat]'); if (c) { cat = c.dataset.cat; el.querySelectorAll('[data-cat]').forEach((o) => o.classList.toggle('on', o === c)); return; }
    const a = e.target.closest('[data-adv]'); if (a) { const l = store(K, []); const r = l.find((x) => x.ref === a.dataset.adv); r.s = Math.min(2, r.s + 1); put(K, l); list(); }
  });
  el.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault(); const err = el.querySelector('[data-err]');
    const place = el.querySelector('[data-place]').value; const desc = el.querySelector('[data-desc]').value.trim();
    const msg = !cat ? 'اختر نوع البلاغ.' : !place ? 'اختر المركز.' : desc.length < 6 ? 'اكتب وصفًا قصيرًا للمشكلة.' : '';
    if (msg) { err.hidden = false; err.textContent = msg; return; }
    err.hidden = true; const l = store(K, []); l.push({ cat, place, desc, s: 0, ref: `DEMO-R${(Date.now() % 10000).toString().padStart(4, '0')}` }); put(K, l);
    e.target.reset(); cat = ''; el.querySelectorAll('[data-cat]').forEach((o) => o.classList.remove('on')); list();
  });
  list();
}

// ---------- dashboard ----------
function dashboardUI() {
  const total = projects.length; const by = (k, v) => projects.filter((p) => p[k] === v).length;
  const sec = projSectors.map((s) => [s.title, by('sector', s.id), s.color]);
  const plc = places.map((p) => [p.name, by('place', p.id)]).filter((x) => x[1]).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = Math.max(...sec.map((x) => x[1])); const maxP = Math.max(...plc.map((x) => x[1]));
  const rep = store('d360.proto.reports', []); const bk = store('d360.proto.bookings', []);
  return `
  <div class="dash">
    <div class="kpis">${[['إجمالي المشروعات', total], ['جاري التنفيذ', by('status', 'ongoing')], ['مكتمل', by('status', 'done')], ['مخطط', by('status', 'planned')], ['ضمن حياة كريمة', projects.filter((p) => p.hayaKarima).length], ['بلاغات النموذج', rep.length], ['حجوزات النموذج', bk.length]].map(([t, n]) => `<div class="kpi"><b class="heading-4">${n}</b><span class="caption-4">${t}</span></div>`).join('')}</div>
    <div class="charts">
      <section class="chart"><h3 class="title-3">المشروعات حسب القطاع</h3>${sec.map(([t, n, c]) => `<div class="hb"><span class="caption-4">${t}</span><span class="hb__t"><i style="width:${(n / max) * 100}%;background:${c}"></i></span><b class="caption-3">${n}</b></div>`).join('')}</section>
      <section class="chart"><h3 class="title-3">أكثر المراكز مشروعات</h3>${plc.map(([t, n]) => `<div class="hb"><span class="caption-4">${t}</span><span class="hb__t"><i style="width:${(n / maxP) * 100}%"></i></span><b class="caption-3">${n}</b></div>`).join('')}</section>
    </div>
    <p class="caption-5 muted">كل الأرقام هنا محسوبة من مشروعات الخريطة التجريبية ومن البلاغات والحجوزات التي جربتها في هذا المتصفح.</p>
  </div>`;
}

// ---------- website ----------
function websiteUI(idea) {
  if (!idea) return empty('افتح النموذج من داخل فكرة', 'الموقع التعريفي يُبنى من محتوى مساحة تطوير الفكرة.', '<a class="btn btn--primary" href="#/ideas">أفكار للتطوير</a>');
  const v = (k) => val(idea, k); const li = (k) => v(k).split('\n').filter(Boolean);
  return `
  <div class="site"><div class="show__bar"><i></i><i></i><i></i><span class="caption-5">${esc(v('pname'))}</span></div>
    <section class="site__hero"><span class="eyebrow">${sectorById[idea.sector]?.title || ''}</span><h2 class="heading-3">${esc(v('pname'))}</h2><p class="body-3">${esc(v('pdesc'))}</p><button class="btn btn--primary" type="button">ابدأ الآن (تجريبي)</button></section>
    <section class="site__row"><div><h3 class="title-2">المشكلة</h3><p class="body-6">${esc(v('problem'))}</p></div><div><h3 class="title-2">الحل</h3><p class="body-6">${esc(v('solution'))}</p></div></section>
    <section><h3 class="title-2">ماذا يقدم</h3><div class="site__cards">${li('components').map((c) => `<div class="site__c">${icon('check')}<span class="body-5">${esc(c)}</span></div>`).join('')}</div></section>
    <section><h3 class="title-2">كيف تستخدمه</h3><ol class="hsteps">${li('journey').slice(0, 3).map((s) => `<li><p class="body-6">${esc(s)}</p></li>`).join('')}</ol></section>
  </div>`;
}

export function proto({ type }, query) {
  const id = query.get('idea'); const idea = id ? getIdea(id) : null;
  if (!PROTO_TYPES.some((p) => p.id === type)) return { title: 'غير موجود', html: empty('نوع النموذج غير موجود', '', '<a class="btn btn--primary" href="#/studio">الاستوديو</a>') };
  if (type === 'map') {
    const secs = idea ? IDEA_TO_PROJ[idea.sector] : null;
    return { title: 'خريطة تفاعلية', html: `${head(type, idea, id)}<div class="empty">${icon('map')}<h3>يستخدم هذا النموذج خريطة المشروعات الحالية</h3><p>بدل بناء خريطة جديدة، يفتح الخريطة الموجودة مفلترة على قطاع الفكرة.</p><a class="btn btn--primary" href="#/map${secs ? `?sector=${secs[0]}` : ''}">افتح الخريطة ${icon('arrow')}</a></div>` };
  }
  if (type === 'portal') {
    return { title: 'بوابة خدمات', html: `${head(type, idea, id)}<div class="empty">${icon('grid')}<h3>يستخدم هذا النموذج بوابة الخدمات الحالية</h3><p>البوابة الموجودة تعمل بالفعل كنموذج للبحث بالعامية والوصول للجهة والقناة الرسمية.</p><a class="btn btn--primary" href="#/services">افتح البوابة ${icon('arrow')}</a></div>` };
  }
  const body = { booking: bookingUI(), tracking: trackingUI(idea), reporting: reportingUI(), dashboard: dashboardUI(), website: websiteUI(idea),
    mobile: `<div class="phone"><div class="phone__notch"></div><div class="phone__scr">${reportingUI(true)}</div></div>` }[type];
  return {
    title: PROTO_TYPES.find((p) => p.id === type).t,
    html: `${head(type, idea, id)}${body}`,
    mount(root) {
      if (id && !getWS(id).proto) { saveWS(id, { proto: type }); if (['idea', 'dev'].includes(stageOf(id))) setStage(id, 'proto'); }
      if (type === 'dashboard' && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        root.querySelectorAll('.kpi b').forEach((b) => { const to = +b.textContent; const t0 = performance.now();
          const tick = (t) => { const k = Math.min(1, (t - t0) / 900); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); }; b.textContent = '0'; requestAnimationFrame(tick); setTimeout(() => { b.textContent = to; }, 1300); });
      }
      if (type === 'booking') bookingMount(root);
      if (type === 'tracking') trackingMount(root, idea);
      if (type === 'reporting' || type === 'mobile') reportingMount(root);
    },
  };
}
