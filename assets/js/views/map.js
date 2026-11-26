import { icon, esc, badge, crumbs, empty, agencyById } from '../ui.js?v=202611261625';
import { projects, sectors, projectStatuses } from '../data/projects.js?v=202611261625';
import { places } from '../data/places.js?v=202611261625';
import { CENTER_COORDS, GOV_OUTLINE } from '../data/geo.js?v=202611261625';
import { services } from '../data/services.js?v=202611261625';
import { normalize } from '../lib/search.js?v=202611261625';
import { relatedProjects, relatedIdeasForProject, projectOpportunities, opportunityToIdea, linkProject, allIdeas, SIM_NOTE, sectorById as ideaSector } from '../lib/innovation.js?v=202611261625';
import { isTeam } from '../lib/team.js?v=202611261625';

export const sectorById = Object.fromEntries(sectors.map((s) => [s.id, s]));
export const statusById = Object.fromEntries(projectStatuses.map((s) => [s.id, s]));
export const placeById = Object.fromEntries(places.map((p) => [p.id, p]));

// ---- Leaflet (loaded on demand, only on map pages) ----
let leafletP;
export function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return (leafletP ||= new Promise((res, rej) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='; css.crossOrigin = '';
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='; js.crossOrigin = '';
    js.onload = () => res(window.L); js.onerror = () => { leafletP = null; rej(new Error('leaflet')); };
    document.head.append(css, js);
  }));
}

export function baseMap(L, el, opts = {}) {
  const map = L.map(el, { zoomControl: false, fadeAnimation: false, attributionControl: true, scrollWheelZoom: opts.scroll ?? true, ...opts });
  L.control.zoom({ position: 'topleft', zoomInTitle: 'تكبير', zoomOutTitle: 'تصغير' }).addTo(map);
  map.attributionControl.setPrefix(false);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map);
  L.geoJSON(GOV_OUTLINE, { style: { color: '#4b5a2a', weight: 2, fillColor: '#4b5a2a', fillOpacity: 0.05, dashArray: '6 4' }, interactive: false }).addTo(map);
  return map;
}

const pin = (L, p, active = false) => L.divIcon({
  className: '', iconSize: [30, 30], iconAnchor: [15, 15],
  html: `<span class="mpin ${active ? 'is-on' : ''} st-${p.status}" style="--c:${sectorById[p.sector].color}"></span>`,
});

export const statusPill = (s) => `<span class="spill spill--${s}">${statusById[s].title}</span>`;
export const sectorTag = (id) => `<span class="stag" style="--c:${sectorById[id].color}"><i></i>${sectorById[id].title}</span>`;

const card = (p) => `
  <article class="pjc" data-pid="${p.id}" tabindex="0">
    <div class="pjc__top">${sectorTag(p.sector)}${statusPill(p.status)}</div>
    <h3>${esc(p.name)}</h3>
    <p class="pjc__m">${icon('pin')} ${placeById[p.place].name}${p.hayaKarima ? ' · <span class="hk">حياة كريمة</span>' : ''}</p>
    <div class="pjc__foot">${badge('demo')}<a class="link" href="#/project/${p.id}">التفاصيل ${icon('arrow')}</a></div>
  </article>`;

export function mapView(_, query) {
  const st = {
    q: query.get('q') || '', place: query.get('place') || '', sector: query.get('sector') || '',
    status: query.get('status') || '', hk: query.get('hk') === '1',
  };
  const usedPlaces = places.filter((p) => projects.some((x) => x.place === p.id));
  return {
    title: 'خريطة المشروعات',
    html: `
    ${crumbs([['الدقهلية 360°', '#/'], ['خريطة المشروعات']])}
    <header class="phead phead--row">
      <div><p class="eyebrow">المنتج 02 · خريطة مشروعات الدقهلية</p><h1>المشروعات على الخريطة</h1>
      <p class="lead">استكشف المشروعات حسب المركز والقطاع والحالة، وانتقل لتفاصيل كل مشروع.</p></div>
    </header>
    <div class="demo-banner">${icon('info')}<div><b>كل المشروعات المعروضة بيانات تجريبية</b><span>أسماء وأوصاف وحالات توضيحية لاختبار التجربة فقط، وتُستبدل ببيانات المحافظة الرسمية مع المصدر وتاريخ التحديث.</span></div></div>

    <div class="mapui" data-view="map">
      <aside class="mapui__panel">
        <label class="finput">${icon('search')}<input type="search" data-f="q" placeholder="ابحث باسم مشروع أو مركز…" value="${esc(st.q)}" aria-label="بحث في المشروعات"/></label>
        <div class="mf">
          <span class="flabel">القطاع</span>
          <div class="mf__chips" data-group="sector">
            <button class="fchip ${!st.sector ? 'on' : ''}" data-v="">الكل</button>
            ${sectors.map((s) => `<button class="fchip fchip--dot ${st.sector === s.id ? 'on' : ''}" data-v="${s.id}" style="--c:${s.color}"><i></i>${s.title}</button>`).join('')}
          </div>
        </div>
        <div class="mf mf--row">
          <label class="fselect"><span class="flabel">المركز</span><select data-f="place"><option value="">كل المراكز</option>${usedPlaces.map((p) => `<option value="${p.id}" ${st.place === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}</select></label>
          <label class="fselect"><span class="flabel">الحالة</span><select data-f="status"><option value="">كل الحالات</option>${projectStatuses.map((s) => `<option value="${s.id}" ${st.status === s.id ? 'selected' : ''}>${s.title}</option>`).join('')}</select></label>
        </div>
        <label class="toggle"><input type="checkbox" data-f="hk" ${st.hk ? 'checked' : ''}/><span></span>مشروعات حياة كريمة فقط</label>
        <div class="mstats" aria-live="polite"></div>
        <div class="mlist"></div>
      </aside>
      <div class="mapui__map"><div id="pmap" role="region" aria-label="خريطة المشروعات"></div><div class="mapui__legend">${sectors.map((s) => `<span style="--c:${s.color}"><i></i>${s.title}</span>`).join('')}</div></div>
      <div class="mapui__switch" role="tablist"><button data-switch="map" class="on">${icon('map')} الخريطة</button><button data-switch="list">${icon('grid')} القائمة</button></div>
    </div>`,
    async mount(root) {
      const ui = root.querySelector('.mapui');
      const list = ui.querySelector('.mlist'); const stats = ui.querySelector('.mstats');
      let L, map, layer, markers = {};

      const filtered = () => {
        const nq = normalize(st.q);
        return projects.filter((p) => (!st.place || p.place === st.place) && (!st.sector || p.sector === st.sector)
          && (!st.status || p.status === st.status) && (!st.hk || p.hayaKarima)
          && (!nq || normalize(`${p.name} ${placeById[p.place].name} ${sectorById[p.sector].title}`).includes(nq)));
      };
      const syncUrl = () => {
        const p = new URLSearchParams(); Object.entries(st).forEach(([k, v]) => v && p.set(k, v === true ? '1' : v));
        history.replaceState(null, '', '#/map' + (p.toString() ? '?' + p : ''));
      };
      const focus = (id, open = true) => {
        const m = markers[id]; if (!m || !map) return;
        ui.dataset.view = 'map';
        ui.querySelectorAll('[data-switch]').forEach((b) => b.classList.toggle('on', b.dataset.switch === 'map'));
        map.invalidateSize();
        map.setView(m.getLatLng(), Math.max(map.getZoom(), 12));
        if (open) setTimeout(() => m.openPopup(), 300);
        list.querySelectorAll('.pjc').forEach((c) => c.classList.toggle('on', c.dataset.pid === id));
      };
      let first = true;
      const render = () => {
        const items = filtered();
        const by = (s) => items.filter((p) => p.status === s).length;
        stats.innerHTML = `<div><b>${items.length}</b><span>مشروع</span></div>${projectStatuses.map((s) => `<div><b>${by(s.id)}</b><span>${s.title}</span></div>`).join('')}`;
        list.innerHTML = items.length ? items.map(card).join('') : empty('لا توجد مشروعات مطابقة', 'غيّر الفلاتر أو امسح البحث.', '<button class="btn btn--ghost" data-reset>مسح الفلاتر</button>');
        if (!map) return;
        layer.clearLayers(); markers = {};
        items.forEach((p) => {
          const m = L.marker([p.lat, p.lng], { icon: pin(L, p), title: p.name, keyboard: true })
            .bindPopup(`<div class="mpop">${sectorTag(p.sector)}<b>${esc(p.name)}</b><small>${placeById[p.place].name} · ${statusById[p.status].title}</small>${badge('demo')}<a class="btn btn--primary btn--sm" href="#/project/${p.id}">تفاصيل المشروع</a></div>`, { closeButton: false, offset: [0, -6] });
          m.on('click', () => list.querySelectorAll('.pjc').forEach((c) => c.classList.toggle('on', c.dataset.pid === p.id)));
          layer.addLayer(m); markers[p.id] = m;
        });
        const anim = !first; first = false;
        if (st.place && items.length) map.setView(CENTER_COORDS[st.place], 12, { animate: anim });
        else if (items.length) map.fitBounds(L.latLngBounds(items.map((p) => [p.lat, p.lng])).pad(0.15), { animate: anim, maxZoom: 12 });
        syncUrl();
      };

      ui.addEventListener('input', (e) => {
        const f = e.target.dataset.f; if (!f) return;
        st[f] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; render();
      });
      ui.addEventListener('click', (e) => {
        const chip = e.target.closest('[data-group] [data-v]');
        if (chip) { const g = chip.parentElement.dataset.group; st[g] = chip.dataset.v; chip.parentElement.querySelectorAll('[data-v]').forEach((c) => c.classList.toggle('on', c === chip)); render(); return; }
        const sw = e.target.closest('[data-switch]');
        if (sw) { ui.dataset.view = sw.dataset.switch; ui.querySelectorAll('[data-switch]').forEach((b) => b.classList.toggle('on', b === sw)); setTimeout(() => map?.invalidateSize(), 50); return; }
        if (e.target.closest('[data-reset]')) {
          Object.assign(st, { q: '', place: '', sector: '', status: '', hk: false });
          ui.querySelector('[data-f=q]').value = ''; ui.querySelectorAll('select[data-f]').forEach((s) => (s.value = '')); ui.querySelector('[data-f=hk]').checked = false;
          ui.querySelectorAll('[data-group] [data-v]').forEach((c) => c.classList.toggle('on', c.dataset.v === '')); render(); return;
        }
        const c = e.target.closest('.pjc'); if (c && !e.target.closest('a')) focus(c.dataset.pid);
      });
      list.addEventListener('keydown', (e) => { const c = e.target.closest('.pjc'); if (c && e.key === 'Enter') focus(c.dataset.pid); });

      render();
      try {
        L = await loadLeaflet();
        if (!root.contains(ui)) return; // navigated away while loading
        map = baseMap(L, ui.querySelector('#pmap'));
        map.setView([31.05, 31.55], 9);
        layer = L.layerGroup().addTo(map);
        // Clickable centre labels → filter by centre.
        usedPlaces.forEach((p) => L.marker(CENTER_COORDS[p.id], { icon: L.divIcon({ className: '', html: `<span class="mlabel">${p.name}</span>`, iconSize: null }), keyboard: false })
          .on('click', () => { st.place = p.id; ui.querySelector('[data-f=place]').value = p.id; render(); }).addTo(map));
        render();
      } catch {
        ui.querySelector('#pmap').innerHTML = `<div class="maperr">${icon('info')}<p>تعذّر تحميل الخريطة. تحقق من الاتصال بالإنترنت، القائمة ما زالت تعمل.</p></div>`;
      }
    },
  };
}

const SECTOR_SERVICES = { water: ['water', 'complaint'], electricity: ['electricity'], health: ['state-treatment', 'emergency'], education: ['school-services'], roads: ['complaint'], youth: [] };

export function projectDetail({ id }) {
  const p = projects.find((x) => x.id === id);
  if (!p) return { title: 'غير موجود', html: empty('المشروع غير موجود', 'ربما تغير الرابط.', '<a class="btn btn--primary" href="#/map">خريطة المشروعات</a>') };
  const pl = placeById[p.place]; const ag = agencyById[p.agency]; const sec = sectorById[p.sector];
  const svc = (SECTOR_SERVICES[p.sector] || []).map((sid) => services.find((s) => s.id === sid)).filter(Boolean);
  const others = projects.filter((x) => x.place === p.place && x.id !== p.id);
  return {
    title: p.name,
    html: `
    ${crumbs([['خريطة المشروعات', '#/map'], [pl.name, `#/map?place=${pl.id}`], [p.name]])}
    <div class="demo-banner">${icon('info')}<div><b>مشروع تجريبي</b><span>هذه الصفحة توضح شكل صفحة المشروع. لا تمثل مشروعًا حقيقيًا.</span></div></div>
    <div class="detail">
      <div class="detail__main">
        <header class="dhead"><span class="dhead__ic" style="background:${sec.color};color:#fff">${icon(sec.icon)}</span>
          <div><div class="row gap" style="gap:8px;margin-bottom:8px">${sectorTag(p.sector)}${statusPill(p.status)}${p.hayaKarima ? '<span class="hk">حياة كريمة</span>' : ''}</div>
          <h1>${esc(p.name)}</h1><p class="lead">${esc(p.description)}</p></div></header>
        <div class="info info--4">
          <div class="info__i"><span>${icon('pin')} الموقع</span><a href="#/place/${pl.id}"><b>${pl.name}</b></a><small class="muted">موقع تقريبي على الخريطة</small></div>
          <div class="info__i"><span>${icon('building')} الجهة المسؤولة</span><a href="#/agency/${ag.id}"><b>${esc(ag.name)}</b></a></div>
          <div class="info__i"><span>${icon('check')} الحالة</span><b>${statusById[p.status].title}</b>${badge('demo')}</div>
          <div class="info__i"><span>${icon('info')} آخر تحديث</span><b>${p.updated}</b>${badge('demo')}</div>
        </div>
        <section class="block"><h2>${icon('map')} الموقع على الخريطة</h2><div class="minimap" id="minimap"></div></section>
        <section class="block"><h2>${icon('layers')} الصور</h2><div class="unv">${icon('info')}<div><b>لا توجد صور موثقة</b><p>تُعرض صور قبل وبعد فقط عند توفرها من مصدر رسمي.</p></div></div></section>
        <section class="block"><h2>${icon('shield')} المصدر الرسمي</h2><div class="unv">${icon('shield')}<div><b>لا يوجد، بيانات تجريبية</b><p>في النسخة الفعلية: رابط المصدر الرسمي للمعلومة وتاريخ التحقق منه.</p></div></div></section>
        ${intelHtml(p)}
      </div>
      <aside class="detail__side">
        ${svc.length ? `<div class="side"><h3>خدمات مرتبطة</h3>${svc.map((s) => `<a class="rel" href="#/service/${s.id}">${esc(s.title)} ${icon('arrow')}</a>`).join('')}</div>` : ''}
        <div class="side"><h3>المنطقة</h3><a class="agmini" href="#/place/${pl.id}"><b>${pl.name}</b><small>الجهة المحلية والخدمات والمشروعات</small></a></div>
        ${others.length ? `<div class="side"><h3>مشروعات أخرى في ${pl.name}</h3>${others.map((o) => `<a class="rel" href="#/project/${o.id}">${esc(o.name)} ${icon('arrow')}</a>`).join('')}</div>` : ''}
        <a class="side side--ai" href="#/map?place=${pl.id}">${icon('map')}<span><b>كل مشروعات ${pl.name}</b><small>على الخريطة</small></span></a>
        <a class="side side--link" href="#/project/${p.id}/brief">${icon('clipboard')}<span><b>ملخص المشروع</b><small>ملف مختصر قابل للطباعة</small></span>${icon('arrow')}</a>
      </aside>
    </div>`,
    async mount(root) {
      root.querySelector('[data-intel]')?.addEventListener('click', (e) => {
        const o = e.target.closest('[data-opp]'); if (o) { const rec = opportunityToIdea(p, projectOpportunities(p)[+o.dataset.opp]); location.hash = `/idea/${rec.id}`; return; }
        const l = e.target.closest('[data-linkidea]'); if (l) { linkProject(l.dataset.linkidea, p.id); dispatchEvent(new HashChangeEvent('hashchange')); }
      });
      root.querySelector('[data-linksel]')?.addEventListener('change', (e) => { if (e.target.value) { linkProject(e.target.value, p.id); dispatchEvent(new HashChangeEvent('hashchange')); } });
      try {
        const L = await loadLeaflet(); const el = root.querySelector('#minimap'); if (!el) return;
        const map = baseMap(L, el, { scroll: false });
        map.setView([p.lat, p.lng], 12);
        L.marker([p.lat, p.lng], { icon: pin(L, p, true), title: p.name }).addTo(map);
      } catch { root.querySelector('#minimap').innerHTML = '<div class="maperr"><p>تعذّر تحميل الخريطة.</p></div>'; }
    },
  };
}

// ---------- Project Intelligence (add-only layer) ----------
function intelHtml(p) {
  const rel = relatedProjects(p); const ri = relatedIdeasForProject(p); const opps = projectOpportunities(p);
  const others = allIdeas().filter((i) => !ri.linked.includes(i)); const team = isTeam();
  return `
  <div class="intel" data-intel>
    <p class="sim">${icon('info')} <span>مقترحات تطوير مرتبطة بالمشروع، وليست حقائق عنه.${team ? ` ${SIM_NOTE}` : ''}</span></p>
    <section class="block"><h2>${icon('link')} مشروعات مرتبطة</h2>
      ${rel.length ? rel.map((r) => `<a class="rel" href="#/project/${r.x.id}"><span><b class="title-4">${esc(r.x.name)}</b><small class="caption-5 muted" style="display:block">${r.why}</small></span>${icon('arrow')}</a>`).join('') : '<p class="muted body-6">لا توجد مشروعات مرتبطة.</p>'}
    </section>
    <section class="block"><h2>${icon('bulb')} أفكار تطوير مرتبطة</h2>
      ${ri.linked.length ? `${team ? '<p class="caption-3">مربوطة بالمشروع</p>' : ''}${ri.linked.map((i) => `<a class="rel" href="#/idea/${i.id}${team ? '' : '/proposal'}">${esc(i.t)} ${icon('arrow')}</a>`).join('')}` : ''}
      ${ri.suggested.length ? `${team ? '<p class="caption-3" style="margin-top:12px">مقترحة من نفس القطاع</p>' : ''}${ri.suggested.map((i) => team ? `<div class="rel"><a href="#/idea/${i.id}">${esc(i.t)}</a><button class="linkbtn caption-4" data-linkidea="${i.id}">اربط بالمشروع</button></div>` : `<a class="rel" href="#/idea/${i.id}/proposal">${esc(i.t)} ${icon('arrow')}</a>`).join('')}` : ''}
      ${team ? `<label class="fselect fselect--wide"><select data-linksel><option value="">اربط المشروع بفكرة موجودة…</option>${others.map((i) => `<option value="${i.id}">${esc(i.t)} · ${ideaSector[i.sector]?.title || ''}</option>`).join('')}</select></label>` : ''}
    </section>
    ${opps.length ? `<section class="block"><h2>${icon('rocket')} فرص التطوير</h2>
      ${opps.map((o, n) => `<div class="rel"><span><b class="title-4">${esc(o.t)}</b><small class="caption-5 muted" style="display:block">${o.type}</small></span>${team ? `<button class="btn btn--ghost btn--sm" data-opp="${n}">${icon('plus')} حوّلها لفكرة</button>` : ''}</div>`).join('')}
    </section>` : ''}
  </div>`;
}

export function projectBrief({ id }) {
  const p = projects.find((x) => x.id === id);
  if (!p) return { title: 'غير موجود', html: empty('المشروع غير موجود', '', '<a class="btn btn--primary" href="#/map">الخريطة</a>') };
  const pl = placeById[p.place]; const ag = agencyById[p.agency]; const rel = relatedProjects(p); const ri = relatedIdeasForProject(p); const opps = projectOpportunities(p);
  const S = (n, t, b) => `<section class="pp__s"><h2 class="heading-6"><span class="caption-3">0${n}</span> ${t}</h2>${b}</section>`;
  return {
    title: `ملخص: ${p.name}`,
    html: `
    ${crumbs([['خريطة المشروعات', '#/map'], [p.name, `#/project/${p.id}`], ['ملخص المشروع']])}
    <div class="pp__bar noprint"><a class="btn btn--ghost btn--sm" href="#/project/${p.id}">${icon('arrow')} صفحة المشروع</a><button class="btn btn--primary btn--sm" data-print>${icon('printer')} طباعة أو حفظ PDF</button></div>
    <article class="pp">
      <header class="pp__h"><p class="caption-3">Dakahlia 360° · ملخص مشروع · بيانات تجريبية</p><h1 class="heading-3">${esc(p.name)}</h1><p class="caption-5 muted">هذا المشروع تجريبي لعرض شكل الملخص ولا يمثل مشروعًا حقيقيًا.</p></header>
      ${S(1, 'نظرة عامة', `<p>${esc(p.description)}</p>`)}
      ${S(2, 'الموقع', `<p>${pl.name} (موقع تقريبي)</p>`)}
      ${S(3, 'الحالة', `<p>${statusById[p.status].title} · آخر تحديث ${p.updated} (تجريبي)</p>`)}
      ${S(4, 'الجهات المعنية', `<ul><li>${esc(ag.name)}</li><li>الوحدة المحلية لمركز ومدينة ${pl.name}</li></ul>`)}
      ${S(5, 'مشروعات مرتبطة', rel.length ? `<ul>${rel.map((r) => `<li>${esc(r.x.name)} (${r.why})</li>`).join('')}</ul>` : '<p>لا يوجد</p>')}
      ${S(6, 'أفكار مرتبطة', [...ri.linked, ...ri.suggested].length ? `<ul>${[...ri.linked, ...ri.suggested].map((i) => `<li>${esc(i.t)}</li>`).join('')}</ul>` : '<p>لا يوجد</p>')}
      ${S(7, 'فرص التطوير (مقترحات)', `<ul>${opps.map((o) => `<li>${esc(o.t)} · ${o.type}</li>`).join('')}</ul>`)}
      ${S(8, 'المصادر', '<p>لا يوجد مصدر رسمي: بيانات تجريبية. في النسخة الفعلية يُذكر رابط المصدر وتاريخ التحقق.</p>')}
    </article>`,
    mount(root) { root.querySelector('[data-print]')?.addEventListener('click', () => print()); },
  };
}

export function placeProjects(placeId) {
  return projects.filter((p) => p.place === placeId);
}
export const projectCard = card;
