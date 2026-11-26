import { icon, esc, badge, crumbs, empty } from '../ui.js?v=202611261557';
import { pois, poiCats, profiles, economy, investSteps, discoverSources as S, SOURCE_KIND } from '../data/discover.js?v=202611261557';
import { places } from '../data/places.js?v=202611261557';
import { services } from '../data/services.js?v=202611261557';
import { projects } from '../data/projects.js?v=202611261557';
import { loadLeaflet, baseMap, placeById } from './map.js?v=202611261557';

const catById = Object.fromEntries(poiCats.map((c) => [c.id, c]));

export const sourceList = (keys) => `<ul class="srcs">${keys.map((k) => S[k]).filter(Boolean).map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${icon('ext')}<span>${esc(s.name)}</span></a><small>${SOURCE_KIND[s.kind]}</small></li>`).join('')}</ul>`;

export const poiCard = (p) => {
  const c = catById[p.cat];
  return `<a class="poi" href="#/poi/${p.id}" style="--t:${c.tone}" data-cat="${p.cat}">
    <span class="poi__art">${icon(c.icon)}<em>${c.title}</em></span>
    <span class="poi__b"><b>${esc(p.name)}</b><small>${icon('pin')} ${placeById[p.place].name}</small><span>${esc(p.short)}</span></span>
  </a>`;
};

const poiPin = (L, p) => L.divIcon({ className: '', iconSize: [34, 34], iconAnchor: [17, 17], html: `<span class="ppin" style="--t:${catById[p.cat].tone}">${icon(catById[p.cat].icon)}</span>` });

export function discover(_, query) {
  const cat = query.get('cat') || '';
  const featured = ['mansoura', 'new-mansoura', 'gamasa'];
  return {
    title: 'اكتشف الدقهلية',
    html: `
    <section class="dhero">
      <div class="dhero__txt">
        <p class="eyebrow">المنتج 03 · اكتشف الدقهلية واستثمر</p>
        <h1 class="heading-1 hgrad">من النيل إلى البحر، <br/>اكتشف الدقهلية</h1>
        <p class="lead">تاريخ يعود لآلاف السنين، وساحل على المتوسط، ومدن جامعية، ومقومات اقتصادية. كل معلومة هنا مرتبطة بمصدرها.</p>
        <div class="row gap"><button class="btn btn--primary btn--lg" data-scroll="explore">ابدأ الاستكشاف ${icon('arrow')}</button></div>
      </div>
      <div class="dhero__art" aria-hidden="true">
        <span class="b b1">${icon('building')}<i>تاريخ وآثار</i></span>
        <span class="b b2">${icon('compass')}<i>ساحل وطبيعة</i></span>
        <span class="b b3">${icon('book')}<i>تعليم ومعرفة</i></span>
        <span class="b b4">${icon('chart')}<i>استثمار</i></span>
      </div>
    </section>

    <section class="sec">
      <header class="sec__h"><p class="eyebrow">مدن مميزة</p><h2>ثلاث وجهات تختصر الدقهلية</h2></header>
      <div class="cities">${featured.map((id) => {
        const p = placeById[id]; const pr = profiles[id];
        return `<a class="city" href="#/place/${id}" style="--bg:${pr.tone};--ac:${pr.accent}"><span class="city__tag">${pr.tag}</span><b>${p.name}</b><span class="city__t">${pr.text}</span><span class="link">صفحة المدينة ${icon('arrow')}</span></a>`;
      }).join('')}</div>
    </section>

    <section class="sec" id="explore">
      <header class="sec__h sec__h--row"><div><p class="eyebrow">استكشف</p><h2>معالم ووجهات</h2></div>
        <div class="fgroup" data-cats>${[['', 'الكل'], ...poiCats.map((c) => [c.id, c.title])].map(([v, t]) => `<button class="fchip ${cat === v ? 'on' : ''}" data-cat="${v}">${t}</button>`).join('')}</div>
      </header>
      <div class="explore">
        <div class="explore__map"><div id="dmap" role="region" aria-label="خريطة المعالم"></div></div>
        <div class="pois">${pois.map(poiCard).join('')}</div>
      </div>
      <p class="hint">${icon('info')} المواقع على الخريطة تقريبية. مواعيد الزيارة والتذاكر غير متحقق منها حالياً، راجع <a href="${S.mota.url}" target="_blank" rel="noopener">وزارة السياحة والآثار</a>.</p>
    </section>

    <section class="sec">
      <header class="sec__h sec__h--row"><div><p class="eyebrow">اقتصاد الدقهلية</p><h2>مقومات تستحق الاهتمام</h2></div><a class="link" href="#/invest">مسار المستثمر ${icon('arrow')}</a></header>
      <div class="econ">${economy.slice(0, 4).map((e) => `<article class="ecard">${icon(e.icon)}<h3>${e.title}</h3><p>${e.text}</p></article>`).join('')}</div>
    </section>

    <section class="cta cta--gold">
      <h2>تفكر في الاستثمار في الدقهلية؟</h2>
      <p>مسار واضح للجهات الرسمية: من اختيار الأرض إلى تأسيس الشركة والتراخيص.</p>
      <a class="btn btn--light btn--lg" href="#/invest">صفحة الاستثمار ${icon('arrow')}</a>
    </section>`,
    async mount(root) {
      const wrap = root.querySelector('.explore');
      let markers = {};
      const apply = (c) => {
        wrap.querySelectorAll('.poi').forEach((el) => (el.hidden = !!c && el.dataset.cat !== c));
        root.querySelectorAll('[data-cats] [data-cat]').forEach((b) => b.classList.toggle('on', b.dataset.cat === c));
        Object.entries(markers).forEach(([id, m]) => { const p = pois.find((x) => x.id === id); m.setOpacity(!c || p.cat === c ? 1 : 0.15); });
        history.replaceState(null, '', '#/discover' + (c ? '?cat=' + c : ''));
      };
      root.querySelector('[data-cats]').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) apply(b.dataset.cat); });
      try {
        const L = await loadLeaflet(); const el = root.querySelector('#dmap'); if (!el) return;
        const map = baseMap(L, el, { scroll: false });
        map.fitBounds(L.latLngBounds(pois.map((p) => [p.lat, p.lng])).pad(0.12), { animate: false });
        pois.forEach((p) => {
          markers[p.id] = L.marker([p.lat, p.lng], { icon: poiPin(L, p), title: p.name })
            .bindPopup(`<div class="mpop"><b>${esc(p.name)}</b><small>${placeById[p.place].name} · ${catById[p.cat].title}</small><a class="btn btn--primary btn--sm" href="#/poi/${p.id}">التفاصيل</a></div>`, { closeButton: false }).addTo(map);
        });
      } catch { root.querySelector('#dmap').innerHTML = '<div class="maperr"><p>تعذّر تحميل الخريطة.</p></div>'; }
      apply(cat);
    },
  };
}

export function poiDetail({ id }) {
  const p = pois.find((x) => x.id === id);
  if (!p) return { title: 'غير موجود', html: empty('المكان غير موجود', 'ربما تغير الرابط.', '<a class="btn btn--primary" href="#/discover">اكتشف الدقهلية</a>') };
  const c = catById[p.cat]; const pl = placeById[p.place];
  const near = pois.filter((x) => x.place === p.place && x.id !== p.id);
  const pj = projects.filter((x) => x.place === p.place).slice(0, 2);
  return {
    title: p.name,
    html: `
    ${crumbs([['اكتشف الدقهلية', '#/discover'], [c.title, `#/discover?cat=${c.id}`], [p.name]])}
    <header class="poihero" style="--t:${c.tone}">
      <span class="poihero__ic">${icon(c.icon)}</span>
      <div><span class="pill">${c.title}</span><h1>${esc(p.name)}</h1><p class="lead">${esc(p.short)}</p>
      <p class="meta">${icon('pin')} <a href="#/place/${pl.id}">${pl.name}</a></p></div>
    </header>
    <div class="detail">
      <div class="detail__main">
        <section class="block"><h2>${icon('info')} نبذة</h2><p>${esc(p.body)}</p></section>
        <section class="block"><h2>${icon('map')} الموقع</h2><div class="minimap" id="minimap"></div><p class="hint">${icon('info')} موقع تقريبي من OpenStreetMap.</p></section>
        <section class="block"><h2>${icon('compass')} معلومات الزيارة ${badge('unverified')}</h2>
          <div class="unv">${icon('shield')}<div><b>المواعيد والتذاكر وإتاحة الزيارة غير متحقق منها حالياً</b><p>تُضاف بعد اعتمادها من الجهة المختصة. للاستفسار: <a href="${S.mota.url}" target="_blank" rel="noopener">وزارة السياحة والآثار</a>.</p></div></div>
        </section>
        <section class="block"><h2>${icon('shield')} المصادر</h2>${sourceList(p.sources)}</section>
      </div>
      <aside class="detail__side">
        <div class="side"><h3>المنطقة</h3><a class="agmini" href="#/place/${pl.id}"><b>${pl.name}</b><small>الخدمات والمشروعات والمعالم</small></a></div>
        ${near.length ? `<div class="side"><h3>قريب منه</h3>${near.map((n) => `<a class="rel" href="#/poi/${n.id}">${esc(n.name)} ${icon('arrow')}</a>`).join('')}</div>` : ''}
        ${pj.length ? `<div class="side"><h3>مشروعات في ${pl.name} ${badge('demo')}</h3>${pj.map((x) => `<a class="rel" href="#/project/${x.id}">${esc(x.name)} ${icon('arrow')}</a>`).join('')}</div>` : ''}
        <a class="side side--ai" href="#/discover">${icon('compass')}<span><b>كل المعالم</b><small>على الخريطة</small></span></a>
      </aside>
    </div>`,
    async mount(root) {
      try {
        const L = await loadLeaflet(); const el = root.querySelector('#minimap'); if (!el) return;
        const map = baseMap(L, el, { scroll: false }); map.setView([p.lat, p.lng], 12);
        L.marker([p.lat, p.lng], { icon: poiPin(L, p), title: p.name }).addTo(map);
      } catch { root.querySelector('#minimap').innerHTML = '<div class="maperr"><p>تعذّر تحميل الخريطة.</p></div>'; }
    },
  };
}

export function invest() {
  const svcById = Object.fromEntries(services.map((s) => [s.id, s]));
  return {
    title: 'الاستثمار في الدقهلية',
    html: `
    ${crumbs([['اكتشف الدقهلية', '#/discover'], ['الاستثمار']])}
    <header class="phead"><p class="eyebrow">للمستثمرين وأصحاب الأعمال</p><h1>الاستثمار في الدقهلية</h1>
      <p class="lead">مقومات موثقة بمصادرها، ومسار واضح للجهات الرسمية. لا نعرض فرصة استثمارية إلا إذا كانت مؤكدة رسميًا.</p></header>

    <section class="sec sec--tight"><header class="sec__h"><h2>المقومات</h2></header>
      <div class="econ econ--full">${economy.map((e) => `<article class="ecard">${icon(e.icon)}<h3>${e.title}</h3><p>${e.text}</p><details><summary>المصادر</summary>${sourceList(e.sources)}</details></article>`).join('')}</div>
    </section>

    <section class="sec"><header class="sec__h"><h2>مسار المستثمر</h2><p class="muted">إرشاد للوصول إلى القنوات الرسمية، وليس بديلًا عن الإجراءات المعلنة من الجهات.</p></header>
      <ol class="path">${investSteps.map((s) => `<li><div><b>${s.t}</b><p>${s.d}</p>
        <div class="row gap" style="gap:8px">${s.links.map((k) => `<a class="src" href="${S[k].url}" target="_blank" rel="noopener">${icon('ext')}<span>${S[k].name}</span></a>`).join('')}${s.svc ? `<a class="chip chip--link" href="#/service/${s.svc}">${esc(svcById[s.svc].title)} ←</a>` : ''}</div></div></li>`).join('')}</ol>
    </section>

    <section class="sec"><header class="sec__h sec__h--row"><h2>الفرص الاستثمارية</h2>${badge('unverified', 'لا توجد فرص مؤكدة معروضة')}</header>
      <div class="opps">
        <div class="unv unv--big">${icon('shield')}<div><b>لا نعرض حاليًا أي فرصة استثمارية</b><p>لن تظهر هنا إلا الفرص المعلنة رسميًا من المحافظة أو الجهات المختصة، مع مصدرها وتاريخ تحديثها. حتى ذلك الحين، تابع الطروحات الرسمية:</p>
          <div class="row gap" style="gap:8px;margin-top:8px"><a class="src" href="${S.madein.url}" target="_blank" rel="noopener">${icon('ext')}<span>طروحات الأراضي الصناعية</span></a><a class="src" href="${S.investinegypt.url}" target="_blank" rel="noopener">${icon('ext')}<span>Invest in Egypt</span></a><a class="src" href="${S.nuca.url}" target="_blank" rel="noopener">${icon('ext')}<span>أراضي المدن الجديدة</span></a></div></div></div>
        <article class="opp-demo"><div class="row gap" style="gap:8px">${badge('demo')}<span class="pill">نموذج لشكل البطاقة</span></div>
          <h3>اسم الفرصة كما تعلنه الجهة</h3>
          <dl><dt>القطاع</dt><dd>يُعلن لاحقًا</dd><dt>الموقع</dt><dd>يُعلن لاحقًا</dd><dt>الجهة المعلنة</dt><dd>يُعلن لاحقًا</dd><dt>آخر تحديث</dt><dd>يُعلن لاحقًا</dd><dt>المصدر الرسمي</dt><dd>يُعلن لاحقًا</dd></dl>
        </article>
      </div>
    </section>

    <section class="sec split">
      <a class="tile" href="#/place/gamasa">${icon('building')}<h3>جمصة</h3><p>المدينة الساحلية والمنطقة الصناعية.</p><span class="link">صفحة المدينة ${icon('arrow')}</span></a>
      <a class="tile" href="#/place/new-mansoura">${icon('pin')}<h3>المنصورة الجديدة</h3><p>مدينة جديدة على الطريق الساحلي.</p><span class="link">صفحة المدينة ${icon('arrow')}</span></a>
      <a class="tile tile--dark" href="#/service/company-setup">${icon('briefcase')}<h3>تأسيس شركة</h3><p>الجهة والقناة الرسمية لتأسيس الشركات.</p><span class="link">الخدمة ${icon('arrow')}</span></a>
    </section>`,
  };
}

// Discover section for a place page.
export function placeDiscover(placeId) {
  const pr = profiles[placeId];
  const list = pois.filter((p) => p.place === placeId);
  return { profile: pr, pois: list };
}
