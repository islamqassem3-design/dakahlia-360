// Landing hero: dark olive, the real Dakahlia outline drawing itself, centres lighting up,
// the three products orbiting the map, mouse-driven depth, counting numbers and a moving query strip.
import { icon } from '../ui.js?v=202611261625';
import { GOV_OUTLINE, CENTER_COORDS } from '../data/geo.js?v=202611261625';
import { places } from '../data/places.js?v=202611261625';
import { services } from '../data/services.js?v=202611261625';
import { sources } from '../data/meta.js?v=202611261625';
import { discoverSources } from '../data/discover.js?v=202611261625';

const W = 560, H = 600, PAD = 36;
const ring = GOV_OUTLINE.coordinates[0];
const lngs = ring.map((c) => c[0]), lats = ring.map((c) => c[1]);
const minX = Math.min(...lngs), maxX = Math.max(...lngs), minY = Math.min(...lats), maxY = Math.max(...lats);
const kx = Math.cos(((minY + maxY) / 2) * Math.PI / 180);
const sc = Math.min((W - 2 * PAD) / ((maxX - minX) * kx), (H - 2 * PAD) / (maxY - minY));
const ox = (W - (maxX - minX) * kx * sc) / 2, oy = (H - (maxY - minY) * sc) / 2;
const proj = ([lng, lat]) => [ox + (lng - minX) * kx * sc, oy + (maxY - lat) * sc];
const outline = ring.map((c, i) => `${i ? 'L' : 'M'}${proj(c).map((v) => v.toFixed(1)).join(',')}`).join('') + 'Z';

const LABELS = ['mansoura', 'gamasa', 'new-mansoura', 'mit-ghamr', 'manzala', 'sherbin', 'aga', 'dikirnis', 'belqas', 'matariya'];
const PULSE = ['mansoura', 'gamasa', 'mit-ghamr'];
const nSources = Object.keys(sources).length + Object.keys(discoverSources).length;
const QUERIES = ['عايز أطلع ترخيص لمحل', 'النور قاطع عندنا', 'فيه آثار في شربين؟', 'مشروعات المياه في ميت غمر', 'إزاي أجدد رخصة العربية', 'عايز أشتكي من الزبالة', 'أماكن أخرج فيها في المنصورة', 'عايز أستثمر في الدقهلية', 'بطاقتي ضاعت', 'شهادة ميلاد مميكنة'];

export function heroHtml() {
  const dots = places.map((p, n) => {
    const [x, y] = proj([CENTER_COORDS[p.id][1], CENTER_COORDS[p.id][0]]);
    const lab = LABELS.includes(p.id);
    return `<g class="hx__c ${PULSE.includes(p.id) ? 'is-pulse' : ''}" style="--d:${(1.6 + n * 0.07).toFixed(2)}s" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      ${PULSE.includes(p.id) ? '<circle class="hx__pulse" r="6"/>' : ''}<circle class="hx__dot" r="${p.capital ? 6 : 4}"/>
      ${lab ? `<text class="hx__lbl" x="${p.id === 'gamasa' || p.id === 'manzala' || p.id === 'matariya' ? -10 : 10}" y="4" text-anchor="${p.id === 'gamasa' || p.id === 'manzala' || p.id === 'matariya' ? 'end' : 'start'}">${p.name}</text>` : ''}</g>`;
  }).join('');
  return `
  <section class="hx" aria-label="الدقهلية 360°">
    <div class="hx__in">
      <div class="hx__txt">
        <p class="hx__k caption-3">${icon('spark')} Dakahlia 360° · نموذج أولي تفاعلي</p>
        <h1 class="hx__h">كل ما يحتاجه أهل <em>الدقهلية</em> <br/>من محافظتهم، <span class="nw">في مكان واحد</span></h1>
        <p class="hx__sub">اكتب احتياجك بالعامية فتصل للخدمة والجهة والقناة الرسمية، وتابع مشروعات مركزك على الخريطة، واكتشف مدن المحافظة وفرصها. كل معلومة مرتبطة بمصدرها.</p>
        <div class="hx__act">
          <a class="btn btn--primary btn--lg" href="#/services">جرّب المنصة الآن ${icon('arrow')}</a>
          <button class="hx__ask" data-assistant="">${icon('spark')} أو اسأل المساعد</button>
        </div>
        <dl class="hx__stats">
          <div><dt data-count="${services.length}">0</dt><dd>خدمة مفهرسة</dd></div>
          <div><dt data-count="${places.length}">0</dt><dd>مركزًا ومدينة</dd></div>
          <div><dt data-count="${nSources}">0</dt><dd>مصدرًا تم فحصه</dd></div>
        </dl>
      </div>
      <div class="hx__stage" aria-hidden="true">
        <div class="hx__tilt">
          <svg class="hx__map" viewBox="0 0 ${W} ${H}">
            <path class="hx__fill" d="${outline}"/>
            <path class="hx__line" d="${outline}" pathLength="1"/>
            ${dots}
          </svg>
        </div>
        <div class="hx__orbit">
          <a class="hx__chip c1" href="#/services">${icon('grid')}<span>بوابة الخدمات</span></a>
          <a class="hx__chip c2" href="#/map">${icon('map')}<span>خريطة المشروعات</span></a>
          <a class="hx__chip c3" href="#/discover">${icon('compass')}<span>اكتشف واستثمر</span></a>
        </div>
      </div>
    </div>
  </section>
  <div class="mq" aria-label="أمثلة لأسئلة بالعامية">
    <div class="mq__track">${[...QUERIES, ...QUERIES].map((q) => `<button class="mq__i" data-assistant="${q}">${icon('search')} «${q}»</button>`).join('')}</div>
  </div>`;
}

export function mountHero(root) {
  const hx = root.querySelector('.hx'); if (!hx) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => hx.classList.add('is-in'), 40);
  // count up the numbers
  hx.querySelectorAll('[data-count]').forEach((el) => {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now() + 500;
    const tick = (t) => { const k = Math.max(0, Math.min(1, (t - t0) / 1400)); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1 && root.contains(el)) requestAnimationFrame(tick); };
    requestAnimationFrame(tick); setTimeout(() => { el.textContent = to; }, 2400);
  });
  // mouse depth: the map tilts toward the pointer, the orbit drifts the other way
  if (reduce || !matchMedia('(pointer: fine)').matches) return;
  const tilt = hx.querySelector('.hx__tilt'), orbit = hx.querySelector('.hx__orbit');
  const s = { x: 0, y: 0, tx: 0, ty: 0 }; let raf = 0;
  const step = () => {
    s.x += (s.tx - s.x) * 0.08; s.y += (s.ty - s.y) * 0.08;
    tilt.style.transform = `rotateX(${(-s.y * 10).toFixed(2)}deg) rotateY(${(s.x * 12).toFixed(2)}deg)`;
    orbit.style.translate = `${(-s.x * 18).toFixed(1)}px ${(-s.y * 14).toFixed(1)}px`;
    raf = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > 0.001 ? requestAnimationFrame(step) : 0;
  };
  hx.addEventListener('pointermove', (e) => {
    const r = hx.getBoundingClientRect();
    s.tx = (e.clientX - r.left) / r.width - 0.5; s.ty = (e.clientY - r.top) / r.height - 0.5;
    if (!raf) raf = requestAnimationFrame(step);
  });
  hx.addEventListener('pointerleave', () => { s.tx = 0; s.ty = 0; if (!raf) raf = requestAnimationFrame(step); });
}
