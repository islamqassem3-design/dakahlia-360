import { icon } from '../ui.js';
import { services } from '../data/services.js';
import { agencies } from '../data/catalog.js';
import { places } from '../data/places.js';

const products = [
  { n: '01', t: 'بوابة خدمات الدقهلية', d: 'تبدأ من احتياج المواطن لا من أسماء الجهات: اكتب ما تريد، وتصل للخدمة والجهة والقناة الرسمية.', st: 'متاح للتجربة الآن', live: true, href: '#/services', ic: 'grid' },
  { n: '02', t: 'خريطة مشروعات الدقهلية', d: 'المشروعات على خريطة تفاعلية حسب المركز والقطاع، مع الجهة المسؤولة وآخر تحديث موثق ومصدره.', st: 'متاح للتجربة الآن', live: true, href: '#/map', ic: 'map' },
  { n: '03', t: 'اكتشف الدقهلية واستثمر', d: 'تجربة بصرية للمدن والوجهات والمقومات الاقتصادية، تعرض الفرص المؤكدة رسميًا فقط.', st: 'متاح للتجربة الآن', live: true, href: '#/discover', ic: 'compass' },
];

const pains = [
  ['المواطن لا يعرف الجهة', 'يبدأ بسؤال «أروح فين؟» قبل أي إجراء، ويتنقل بين جهات ومواقع متعددة.'],
  ['المعلومة متفرقة', 'الخدمات والقرارات والمشروعات موزعة بين أخبار وصفحات وروابط لا يجمعها مسار واحد.'],
  ['التنمية غير مرئية', 'المشروعات تُعرض كأخبار متفرقة، فلا يرى المواطن الصورة الكاملة لما يحدث في منطقته.'],
];

const principles = [
  ['shield', 'الدقة قبل الكمية', 'لكل معلومة مصدر رسمي وتاريخ تحقق. وما لم يتأكد يُكتب صراحة: «غير متحقق منها حالياً».'],
  ['layers', 'نكمل ولا نستبدل', 'لا نكرر الأنظمة الحكومية القائمة؛ نوجّه المواطن إليها بوضوح ونحسّن تجربة الوصول.'],
  ['spark', 'ذكاء له وظيفة', 'مساعد يفهم العامية ويوجّه للخدمة الصحيحة، ولا يخترع إجراءات أو رسومًا.'],
  ['grid', 'تجربة واحدة', 'خدمات ومشروعات ومدن في منصة واحدة بتصميم موحد، عربية أولًا، وللموبايل أولًا.'],
];

export function intro() {
  return {
    title: 'الدقهلية 360°',
    html: `
    <section class="hero">
      <div class="hero__ring" aria-hidden="true">
        <svg viewBox="0 0 400 400"><defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--gold)"/></linearGradient></defs>
          <circle cx="200" cy="200" r="170" class="r1"/><circle cx="200" cy="200" r="130" class="r2"/><circle cx="200" cy="200" r="170" class="r3" stroke="url(#rg)"/>
          <g class="orbit"><circle cx="200" cy="30" r="9"/><circle cx="347" cy="285" r="7"/><circle cx="53" cy="285" r="7"/></g>
        </svg>
        <span class="hero__deg">360°</span>
      </div>
      <div class="hero__txt">
        <p class="eyebrow">DAKAHLIA 360° · نموذج أولي تفاعلي</p>
        <h1>تجربة رقمية واحدة<br/>لخدمات ومشروعات ومدن <em>الدقهلية</em></h1>
        <p class="lead">منصة تبدأ من سؤال المواطن «عايز أعمل إيه؟» وتوصله للخدمة والجهة والقناة الرسمية الصحيحة، ثم تفتح له صورة كاملة لمشروعات محافظته ومدنها وفرصها.</p>
        <div class="row gap">
          <a class="btn btn--primary btn--lg" href="#/services">جرّب بوابة الخدمات ${icon('arrow')}</a>
          <button class="btn btn--ghost btn--lg" data-assistant="عايز أطلع ترخيص لمحل">${icon('spark')} اسأل المساعد</button>
        </div>
        <dl class="stats">
          <div><dt>${services.length}</dt><dd>خدمة مفهرسة</dd></div>
          <div><dt>${agencies.length}</dt><dd>جهة ومنصة رسمية</dd></div>
          <div><dt>${places.length}</dt><dd>مركز ومدينة</dd></div>
        </dl>
      </div>
    </section>

    <section class="sec">
      <header class="sec__h"><p class="eyebrow">لماذا</p><h2>المشكلة ليست في الخدمة، بل في الوصول إليها</h2></header>
      <div class="pains">${pains.map(([t, d], i) => `<article class="pain"><span class="pain__n">0${i + 1}</span><h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    </section>

    <section class="sec">
      <header class="sec__h"><p class="eyebrow">الحل</p><h2>ثلاثة منتجات مترابطة تحت مظلة واحدة</h2></header>
      <div class="products">${products.map((p) => `
        <a class="product ${p.n === '01' ? 'is-live' : ''}" href="${p.href}">
          <div class="product__top"><span class="product__n">${p.n}</span><span class="pill ${p.live ? 'pill--live' : ''}">${p.st}</span></div>
          <span class="product__ic">${icon(p.ic)}</span>
          <h3>${p.t}</h3><p>${p.d}</p>
          <span class="link">${p.live ? 'افتح النموذج' : 'ما الذي سيتضمنه'} ${icon('arrow')}</span>
        </a>`).join('')}</div>
    </section>

    <section class="sec">
      <header class="sec__h"><p class="eyebrow">جرّبها بنفسك</p><h2>اكتب كما تتكلم… والبوابة تفهم</h2></header>
      <div class="try">
        ${['عايز أطلع ترخيص لمحل', 'النور قاطع عندنا', 'إزاي أجدد رخصة العربية', 'عايز أشتكي من الزبالة', 'بطاقتي ضاعت'].map((q) => `<a class="trychip" href="#/browse?q=${encodeURIComponent(q)}">${icon('search')}«${q}»</a>`).join('')}
      </div>
    </section>

    <section class="sec">
      <header class="sec__h"><p class="eyebrow">المبادئ</p><h2>كيف نبني الثقة</h2></header>
      <div class="principles">${principles.map(([ic, t, d]) => `<article class="pr">${icon(ic)}<h3>${t}</h3><p>${d}</p></article>`).join('')}</div>
    </section>

    <section class="cta">
      <h2>ابدأ من بوابة الخدمات</h2>
      <p>المنتجات الثلاثة جاهزة للتجربة: بوابة خدمات ببحث ذكي ومساعد يفهم العامية، وخريطة تفاعلية للمشروعات، وتجربة لاكتشاف المحافظة ومسار واضح للمستثمر.</p>
      <div class="row gap"><a class="btn btn--light btn--lg" href="#/services">ادخل البوابة ${icon('arrow')}</a><a class="btn btn--ghost btn--lg" href="#/map">خريطة المشروعات</a><a class="btn btn--ghost btn--lg" href="#/discover">اكتشف الدقهلية</a></div>
    </section>`,
  };
}
