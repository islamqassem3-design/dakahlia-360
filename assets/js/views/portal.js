import { icon, esc, badge, serviceCard, crumbs, searchBox, empty, sourceLink, sourceNote, agencyById, catById } from '../ui.js?v=202611261630';
import { categories, agencies, hotlines } from '../data/catalog.js?v=202611261630';
import { services } from '../data/services.js?v=202611261630';
import { places } from '../data/places.js?v=202611261630';
import { sources, STATUS } from '../data/meta.js?v=202611261630';
import { searchServices, findPlaces } from '../lib/search.js?v=202611261630';
const SVC_SECTOR = { water: 'water', electricity: 'electricity', 'state-treatment': 'health', emergency: 'health', 'school-services': 'education' };
const SECTOR_T = { water: 'مياه وصرف صحي', electricity: 'كهرباء', health: 'صحة', education: 'تعليم' };

const svcById = Object.fromEntries(services.map((s) => [s.id, s]));

export function portalHome() {
  const popular = services.filter((s) => s.popular);
  return {
    title: 'بوابة الخدمات',
    html: `
    <section class="phero">
      <p class="eyebrow">بوابة خدمات الدقهلية · المنتج 01</p>
      <h1 class="heading-2 hgrad">ماذا تريد أن تنجز اليوم؟</h1>
      <p class="lead">اكتب احتياجك بكلماتك، وسنرشدك للخدمة والجهة المختصة والقناة الرسمية.</p>
      ${searchBox('', true)}
      <div class="qchips">${['ترخيص محل', 'تجديد رخصة القيادة', 'شهادة ميلاد', 'بطاقة تموين', 'الميه قاطعة'].map((q) => `<a href="#/browse?q=${encodeURIComponent(q)}">${q}</a>`).join('')}</div>
    </section>

    <section class="sec">
      <header class="sec__h sec__h--row"><h2>تصفح حسب احتياجك</h2><a class="link" href="#/browse">كل الخدمات ${icon('arrow')}</a></header>
      <div class="cats">${categories.map((c) => {
        const n = services.filter((s) => s.cat === c.id).length;
        return `<a class="cat" href="#/browse?cat=${c.id}"><span class="cat__ic">${icon(c.icon)}</span><span class="cat__t">${c.title}</span><span class="cat__h">${c.hint}</span><span class="cat__n">${n} ${n === 1 ? 'خدمة' : 'خدمات'}</span></a>`;
      }).join('')}</div>
    </section>

    <section class="sec">
      <header class="sec__h"><h2>الأكثر طلبًا</h2></header>
      <div class="slist">${popular.map((s) => serviceCard(s)).join('')}</div>
    </section>

    <section class="sec split">
      <a class="tile tile--dark" href="#/complaints">${icon('chat')}<h3>عندك مشكلة أو شكوى؟</h3><p>نرشدك للقناة الرسمية الصحيحة حسب نوع المشكلة.</p><span class="link">ابدأ ${icon('arrow')}</span></a>
      <a class="tile" href="#/places">${icon('pin')}<h3>خدمات مركزك ومدينتك</h3><p>اختر مركزك لتصل للجهات والخدمات المحلية.</p><span class="link">اختر المركز ${icon('arrow')}</span></a>
      <a class="tile" href="#/agencies">${icon('building')}<h3>دليل الجهات</h3><p>المديريات والهيئات والمنصات الرسمية وروابطها.</p><span class="link">تصفح الجهات ${icon('arrow')}</span></a>
    </section>

    <section class="sec">
      <header class="sec__h sec__h--row"><h2>أرقام الطوارئ والخطوط الساخنة</h2>${badge('unverified', 'تُراجع مع المحافظة قبل الاعتماد')}</header>
      <div class="hotlines">${hotlines.map((h) => `<a class="hot" href="tel:${h.n}"><b>${h.n}</b><span>${h.label}</span></a>`).join('')}</div>
    </section>`,
  };
}

export function browse(_, query) {
  const q = query.get('q') || '';
  const cat = query.get('cat') || '';
  const channel = query.get('ch') || '';
  const agency = query.get('ag') || '';
  const results = searchServices(q, { cat: cat || null, channel: channel || null, agency: agency || null });
  const c = catById[cat];
  const placeHit = q ? findPlaces(q) : [];
  const usedAgencies = agencies.filter((a) => services.some((s) => s.agency === a.id));
  const link = (patch) => {
    const p = new URLSearchParams({ q, cat, ch: channel, ag: agency, ...patch });
    [...p.keys()].forEach((k) => !p.get(k) && p.delete(k));
    return '#/browse' + (p.toString() ? '?' + p : '');
  };
  const title = q ? `نتائج «${q}»` : c ? c.title : 'كل الخدمات';
  return {
    title,
    html: `
    ${crumbs([['الخدمات', '#/services'], [title]])}
    <header class="phead"><h1>${esc(title)}</h1>${searchBox(q)}</header>
    <div class="filters" role="group" aria-label="تصفية النتائج">
      <div class="fgroup"><span class="flabel">التصنيف</span>
        <a class="fchip ${!cat ? 'on' : ''}" href="${link({ cat: '' })}">الكل</a>
        ${categories.map((x) => `<a class="fchip ${cat === x.id ? 'on' : ''}" href="${link({ cat: x.id })}">${x.title}</a>`).join('')}
      </div>
      <div class="frow">
        <div class="fgroup"><span class="flabel">طريقة الوصول</span>
          ${[['', 'الكل'], ['online', 'رابط إلكتروني'], ['office', 'حضوري'], ['phone', 'خط ساخن']].map(([v, t]) => `<a class="fchip ${channel === v ? 'on' : ''}" href="${link({ ch: v })}">${t}</a>`).join('')}
        </div>
        <label class="fselect"><span class="flabel">الجهة</span>
          <select data-nav>${[`<option value="${link({ ag: '' })}">كل الجهات</option>`, ...usedAgencies.map((a) => `<option value="${link({ ag: a.id })}" ${agency === a.id ? 'selected' : ''}>${esc(a.name)}</option>`)].join('')}</select>
        </label>
      </div>
    </div>
    ${placeHit.length ? `<div class="note">${icon('pin')}<span>يبدو أنك تسأل عن <b>${placeHit.map((p) => `<a href="#/place/${p.id}">${p.name}</a>`).join('، ')}</b>، افتح صفحة المركز لرؤية الجهات المحلية.</span></div>` : ''}
    <p class="count" aria-live="polite">${results.length} ${results.length === 1 ? 'نتيجة' : 'نتائج'}</p>
    ${results.length ? `<div class="slist">${results.map((r) => serviceCard(r.s)).join('')}</div>`
      : empty('لم نجد خدمة مطابقة', 'جرّب كلمات أخرى، أو اسأل المساعد الذكي بصياغتك، أو تواصل مع الجهة عبر القنوات الرسمية.', `<div class="row gap center"><button class="btn btn--primary" data-assistant="${esc(q)}">${icon('spark')} اسأل المساعد</button><a class="btn btn--ghost" href="${link({ cat: '', ch: '', ag: '' })}">إزالة الفلاتر</a></div>`)}`,
  };
}

const channelCard = (ch) => {
  if (ch.kind === 'online') {
    const s = sources[ch.source];
    return `<a class="chan" href="${s.url}" target="_blank" rel="noopener"><span class="chan__ic">${icon('globe')}</span><span><b>${esc(ch.label)}</b><small>${STATUS[s.status].label} · يفتح في نافذة جديدة</small></span>${icon('ext', 'chan__go')}</a>`;
  }
  if (ch.kind === 'phone') return `<a class="chan" href="tel:${ch.number}"><span class="chan__ic">${icon('phone')}</span><span><b>${ch.number}: ${esc(ch.label)}</b><small>اضغط للاتصال</small></span></a>`;
  return `<a class="chan" href="#/agency/${ch.agency}"><span class="chan__ic">${icon('building')}</span><span><b>${esc(ch.label)}</b><small>حضوري · العناوين ومواعيد العمل غير متحقق منها حالياً</small></span>${icon('arrow', 'chan__go')}</a>`;
};

export function serviceDetail({ id }) {
  const s = svcById[id];
  if (!s) return { title: 'غير موجود', html: empty('الخدمة غير موجودة', 'ربما تغير الرابط.', '<a class="btn btn--primary" href="#/services">العودة للخدمات</a>') };
  const a = agencyById[s.agency]; const c = catById[s.cat];
  const local = s.agency === 'local-units';
  const related = (s.related || []).map((r) => svcById[r]).filter(Boolean);
  return {
    title: s.title,
    html: `
    ${crumbs([['الخدمات', '#/services'], [c.title, `#/browse?cat=${c.id}`], [s.title]])}
    <div class="detail">
      <div class="detail__main">
        <header class="dhead">
          <span class="dhead__ic">${icon(c.icon)}</span>
          <div><h1>${esc(s.title)}</h1><p class="lead">${esc(s.summary)}</p>
          <p class="meta">الجهة المختصة: <a href="#/agency/${a.id}">${esc(a.name)}</a></p></div>
        </header>

        <section class="block"><h2>${icon('globe')} أين تُقدَّم الخدمة؟</h2><div class="chans">${s.channels.map(channelCard).join('')}</div></section>

        <section class="block"><h2>${icon('compass')} إرشاد الوصول</h2>
          <ol class="steps">${s.guide.map((g) => `<li>${esc(g)}</li>`).join('')}</ol>
          <p class="hint">${icon('info')} هذا إرشاد للوصول إلى القناة الصحيحة، وليس بديلًا عن الإجراءات الرسمية المعلنة من الجهة.</p>
        </section>

        <section class="block"><h2>${icon('id')} المستندات المطلوبة ${s.docs?.status === 'demo' ? badge('demo') : badge('unverified')}</h2>
          ${s.docs?.status === 'demo'
            ? `<ul class="docs">${s.docs.items.map((d) => `<li>${icon('check')}<span>${esc(d)}</span></li>`).join('')}</ul><p class="hint hint--demo">${icon('info')} قائمة توضيحية لشكل الشاشة فقط. القائمة الرسمية تُعتمد من الجهة المختصة قبل النشر.</p>`
            : `<div class="unv">${icon('shield')}<div><b>غير متحقق منها حالياً</b><p>لا ننشر المستندات أو الرسوم أو المدد قبل تأكيدها من الجهة. راجع القناة الرسمية أعلاه للحصول على القائمة المعتمدة.</p></div></div>`}
        </section>

        ${local ? `<section class="block"><h2>${icon('pin')} اختر مركزك</h2><p class="muted">الخدمة تُقدَّم عبر الوحدة المحلية التابع لها العنوان.</p>
          <label class="fselect fselect--wide"><select data-nav><option value="">اختر المركز أو المدينة…</option>${places.map((p) => `<option value="#/place/${p.id}">${p.name}</option>`).join('')}</select></label></section>` : ''}

        <section class="block feedback" data-feedback="${s.id}"><h2>هل وصلت لما تحتاجه؟</h2>
          <div class="row gap"><button class="btn btn--ghost" data-fb="yes">${icon('check')} نعم</button><button class="btn btn--ghost" data-fb="no">لا</button></div>
          <p class="fb__msg muted" hidden></p>
        </section>
        ${sourceNote(a.source)}
      </div>

      <aside class="detail__side">
        <div class="side">
          <h3>الجهة المختصة</h3>
          <a class="agmini" href="#/agency/${a.id}"><b>${esc(a.name)}</b><small>${esc(a.type)} · ${a.scope === 'local' ? 'داخل المحافظة' : 'جهة قومية'}</small></a>
          ${sourceLink(a.source, 'الموقع الرسمي')}
        </div>
        <button class="side side--ai" data-assistant="${esc(s.title)}">${icon('spark')}<span><b>اسأل المساعد</b><small>عن هذه الخدمة بكلماتك</small></span></button>
        ${SVC_SECTOR[s.id] ? `<a class="side side--link" href="#/map?sector=${SVC_SECTOR[s.id]}">${icon('map')}<span><b>مشروعات ${SECTOR_T[SVC_SECTOR[s.id]]}</b><small>على خريطة المشروعات</small></span>${icon('arrow')}</a>` : ''}
        ${related.length ? `<div class="side"><h3>خدمات مرتبطة</h3>${related.map((r) => `<a class="rel" href="#/service/${r.id}">${esc(r.title)} ${icon('arrow')}</a>`).join('')}</div>` : ''}
      </aside>
    </div>`,
    mount(root) {
      root.querySelector('[data-feedback]')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-fb]'); if (!b) return;
        const box = e.currentTarget; const msg = box.querySelector('.fb__msg');
        box.querySelectorAll('[data-fb]').forEach((x) => (x.disabled = true));
        msg.hidden = false;
        msg.textContent = b.dataset.fb === 'yes' ? 'شكرًا لك. يساعدنا رأيك في تحسين البوابة.' : 'شكرًا لك. جرّب المساعد الذكي، أو قدّم استفسارك عبر منظومة الشكاوى الحكومية.';
        try { const k = 'd360.fb'; const d = JSON.parse(localStorage.getItem(k) || '{}'); d[box.dataset.feedback] = b.dataset.fb; localStorage.setItem(k, JSON.stringify(d)); } catch {}
      });
    },
  };
}
