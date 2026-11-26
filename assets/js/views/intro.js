// Landing page (layout A: classic hero plus sections), structured per the landing-page-design skill:
// hero → problem/solution → benefits → tagline reveal → how it works → proof → FAQ → risk reversal → final CTA.
import { icon } from '../ui.js?v=202611261557';
import { services } from '../data/services.js?v=202611261557';
import { places } from '../data/places.js?v=202611261557';
import { sources } from '../data/meta.js?v=202611261557';
import { discoverSources, pois } from '../data/discover.js?v=202611261557';
import { projects } from '../data/projects.js?v=202611261557';

const nSources = Object.keys(sources).length + Object.keys(discoverSources).length;

const products = [
  { n: '01', t: 'بوابة خدمات الدقهلية', d: 'تبدأ من احتياج المواطن لا من أسماء الجهات. اكتب ما تريد، وتصل للخدمة والجهة والقناة الرسمية.', href: '#/services', ic: 'grid', stat: `${services.length} خدمة` },
  { n: '02', t: 'خريطة مشروعات الدقهلية', d: 'مشروعات كل مركز على خريطة واحدة حسب القطاع والحالة، مع الجهة المسؤولة وآخر تحديث ومصدره.', href: '#/map', ic: 'map', stat: `${projects.length} مشروع تجريبي` },
  { n: '03', t: 'اكتشف الدقهلية واستثمر', d: 'مدن ومعالم ومقومات اقتصادية بمصادرها، ومسار واضح للمستثمر إلى الجهات الرسمية.', href: '#/discover', ic: 'compass', stat: `${pois.length} معالم موثقة` },
];

const pains = [
  ['أروح فين؟', 'المواطن يبدأ أي إجراء بالسؤال عن الجهة المختصة، ويتنقل بين مواقع وجهات متعددة.'],
  ['المعلومة متفرقة', 'الخدمات والقرارات والمشروعات موزعة بين أخبار وصفحات وروابط لا يجمعها مسار واحد.'],
  ['التنمية غير مرئية', 'المشروعات تُنشر كأخبار متفرقة، فلا يرى المواطن الصورة الكاملة لما يحدث في مركزه.'],
];

const benefits = [
  ['search', 'سؤال واحد بدل عشر صفحات', 'اكتب بالعامية «عايز أطلع ترخيص لمحل»، فتظهر الخدمة والجهة والرابط الرسمي مباشرة.'],
  ['shield', 'كل معلومة لها مصدر', `${nSources} مصدرًا رسميًا ومرجعيًا تم فحصها، وما لم يتأكد مكتوب صراحة «غير متحقق منه».`],
  ['map', 'التنمية على خريطة', 'مشروعات كل مركز في مكان واحد، بالقطاع والحالة والجهة المسؤولة وتاريخ آخر تحديث.'],
  ['compass', 'واجهة للزائر والمستثمر', 'مدن ومعالم ومقومات اقتصادية، ومسار يبدأ من الأرض وينتهي بالتراخيص عبر الجهات الرسمية.'],
];

const steps = [
  ['اكتب احتياجك', 'بكلماتك وباللهجة التي تتكلم بها، من البحث أو من المساعد في أي صفحة.'],
  ['نوجّهك للمكان الصحيح', 'الخدمة، والجهة المختصة، والقناة الرسمية، ومصدر المعلومة وتاريخ فحصها.'],
  ['تكمل عبر القناة الرسمية', 'التقديم يتم دائمًا لدى الجهة أو منصتها. نحن لا نستبدل أي نظام قائم.'],
];

const faq = [
  ['ما هي Dakahlia 360°؟', 'نموذج أولي لمنصة رقمية واحدة تجمع ثلاثة منتجات: بوابة خدمات، وخريطة مشروعات، وتجربة لاكتشاف المحافظة والاستثمار فيها.'],
  ['هل تحل محل البوابات الحكومية القائمة؟', 'لا. المنصة توجّه المواطن إلى القنوات الرسمية القائمة وتحسّن تجربة الوصول إليها، ولا تستقبل طلبات أو شكاوى بنفسها.'],
  ['هل البيانات المعروضة حقيقية؟', 'أسماء الجهات والروابط الرسمية والمعالم حقيقية ومرتبطة بمصادرها. أما المشروعات على الخريطة وبعض القوائم فبيانات تجريبية عليها شارة واضحة.'],
  ['لماذا تظهر عبارة «غير متحقق منها حاليًا»؟', 'لأننا لا ننشر رسومًا أو مددًا أو عناوين أو مستندات إلا بعد تأكيدها من الجهة المختصة.'],
  ['هل المساعد الذكي يخترع إجابات؟', 'لا. المساعد يسترجع فقط من بيانات المنصة الموثقة ويذكر المصدر، وإذا لم يجد معلومة مؤكدة يقول ذلك ويوجّه للقناة الرسمية.'],
  ['ماذا تحتاج المنصة للانتقال من النموذج إلى التنفيذ؟', 'بيانات معتمدة من المحافظة والجهات (الخدمات، المشروعات، الفرص)، وصلاحيات نشر رسمية، وربط مصرح به مع الأنظمة إن لزم.'],
  ['هل يتم حفظ ما أكتبه؟', 'في هذا النموذج تتم المعالجة داخل المتصفح فقط، ولا يُرسل ما تكتبه إلى أي خادم.'],
  ['هل تعمل على الموبايل؟', 'نعم. المنصة مصممة للموبايل أولًا، وتعمل على أي متصفح حديث دون تثبيت.'],
];

export function intro() {
  return {
    title: 'الدقهلية 360°',
    html: `
    <section class="hero2">
      <p class="eyebrow">Dakahlia 360° · نموذج أولي تفاعلي</p>
      <h1 class="heading-1 hgrad">كل ما يحتاجه أهل الدقهلية <br/>من محافظتهم، <span class="nw">في مكان واحد</span></h1>
      <p class="hero2__sub">اكتب احتياجك بالعامية فتصل للخدمة والجهة والقناة الرسمية، وتابع مشروعات مركزك، واكتشف مدن المحافظة وفرصها. كل معلومة مرتبطة بمصدرها.</p>
      <div class="hero2__act">
        <a class="btn btn--primary btn--lg" href="#/services">جرّب المنصة الآن ${icon('arrow')}</a>
        <p class="proof caption-1">${icon('shield')} <span>${services.length} خدمة · ${places.length} مركزًا ومدينة · ${nSources} مصدرًا تم فحصه</span></p>
      </div>

      <div class="show demo" aria-hidden="true">
        <div class="show__bar"><i></i><i></i><i></i><span class="caption-5">dakahlia 360°</span></div>
        <div class="show__grid">
          <div class="pane">
            <span class="pane__k caption-3">01 · بوابة الخدمات</span>
            <div class="demo__search">${icon('search')}<span class="demo__typed body-5" data-typed="عايز أطلع ترخيص لمحل في ميت غمر"></span><b class="demo__caret"></b></div>
            <div class="demo__res">
              <div class="demo__card"><span class="demo__ic">${icon('store')}</span><div><b class="title-4">ترخيص محل تجاري</b><small class="caption-5">الوحدات المحلية للمراكز والمدن</small></div><span class="demo__go">${icon('arrow')}</span></div>
              <div class="demo__chips"><span>${icon('globe')} الرابط الرسمي</span><span>${icon('shield')} المصدر: بوابة مصر الرقمية</span></div>
            </div>
          </div>
          <div class="pane pane--map">
            <span class="pane__k caption-3">02 · خريطة المشروعات</span>
            <div class="demo__map"><span class="dot d1"></span><span class="dot d2"></span><span class="dot d3"></span><span class="dot d4"></span><span class="dot d5"></span><span class="demo__lbl caption-4">${icon('map')} 3 مشروعات في ميت غمر</span></div>
            <div class="pane__legend caption-5"><span><i style="--c:#0369a1"></i>مياه</span><span><i style="--c:#be123c"></i>صحة</span><span><i style="--c:#7c3aed"></i>تعليم</span><span><i style="--c:#15803d"></i>شباب</span></div>
          </div>
          <div class="pane pane--city">
            <span class="pane__k caption-3">03 · اكتشف الدقهلية</span>
            <div class="mini-city"><span class="caption-4">مصيف الدلتا على البحر</span><b class="heading-5">جمصة</b><small class="caption-5">مدينة ساحلية على البحر المتوسط</small></div>
            <div class="demo__chips"><span>${icon('compass')} شاطئ جمصة</span><span>${icon('building')} المنطقة الصناعية</span></div>
          </div>
        </div>
      </div>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">المشكلة</p><h2 class="heading-3">المشكلة ليست في الخدمة، <br/>بل في الوصول إليها</h2></header>
      <div class="pains">${pains.map(([t, d], i) => `<article class="pain"><span class="caption-3 pain__n">0${i + 1}</span><h3 class="title-1">${t}</h3><p class="body-6">${d}</p></article>`).join('')}</div>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">الحل</p><h2 class="heading-3">ثلاثة منتجات مترابطة <br/>تحت مظلة واحدة</h2></header>
      <div class="products">${products.map((p) => `
        <a class="product" href="${p.href}">
          <div class="product__top"><span class="caption-3 product__n">${p.n}</span><span class="pill pill--live">${p.stat}</span></div>
          <span class="product__ic">${icon(p.ic)}</span>
          <h3 class="heading-6">${p.t}</h3><p class="body-6">${p.d}</p>
          <span class="link">افتح المنتج ${icon('arrow')}</span>
        </a>`).join('')}</div>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">ماذا يتغير</p><h2 class="heading-3">ما الذي يكسبه المواطن والمحافظة</h2></header>
      <div class="benefits">${benefits.map(([ic, t, d]) => `<article class="benefit">${icon(ic)}<div><h3 class="title-2">${t}</h3><p class="body-6">${d}</p></div></article>`).join('')}</div>
    </section>

    <section class="tagline" aria-label="الفكرة في سطرين">
      <p class="heading-2" data-words>المحافظة كلها في شاشة واحدة. سؤال بلغتك، وإجابة من مصدرها، وطريق واضح إلى الجهة الصحيحة.</p>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">كيف تعمل</p><h2 class="heading-3">ثلاث خطوات من السؤال إلى الجهة</h2></header>
      <ol class="hsteps">${steps.map(([t, d]) => `<li><h3 class="title-1">${t}</h3><p class="body-6">${d}</p></li>`).join('')}</ol>
      <div class="try">${['عايز أطلع ترخيص لمحل', 'النور قاطع عندنا', 'فيه آثار في شربين؟', 'مشروعات مياه'].map((q) => `<button class="trychip body-5" data-assistant="${q}">${icon('spark')}«${q}»</button>`).join('')}</div>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">الدقة أولًا</p><h2 class="heading-3">أرقام النموذج كما هي، بلا مبالغة</h2></header>
      <div class="stats">
        <div><b class="heading-3">${services.length}</b><span class="body-6">خدمة مفهرسة بجهتها وقناتها الرسمية</span></div>
        <div><b class="heading-3">${nSources}</b><span class="body-6">مصدرًا رسميًا ومرجعيًا تم فحص روابطه</span></div>
        <div><b class="heading-3">${places.length}</b><span class="body-6">مركزًا ومدينة بصفحة موحدة لكل منها</span></div>
        <div><b class="heading-3">0</b><span class="body-6">رسوم أو مدد أو أرقام منشورة دون مصدر</span></div>
      </div>
      <p class="hint">${icon('info')} <span>تفاصيل كل مصدر وحالة فحصه في <a href="#/data">صفحة مصادر البيانات</a>.</span></p>
    </section>

    <section class="sec" data-reveal>
      <header class="sec__h"><p class="eyebrow">أسئلة شائعة</p><h2 class="heading-3">قبل أن تسأل</h2></header>
      <div class="faq">${faq.map(([q, a], i) => `<details ${i === 0 ? 'open' : ''}><summary class="title-2">${q}</summary><p class="body-3">${a}</p></details>`).join('')}</div>
    </section>

    <section class="cta" data-reveal>
      <p class="caption-3 cta__k">${icon('shield')} بدون ربط بأي نظام حكومي، وبدون جمع بيانات شخصية</p>
      <h2 class="heading-3">جرّبها الآن من أي موبايل</h2>
      <p class="body-3">النموذج لا يستبدل أي منصة قائمة، وكل بيانات تجريبية فيه معلّمة بوضوح.</p>
      <a class="btn btn--light btn--lg" href="#/services">جرّب المنصة الآن ${icon('arrow')}</a>
    </section>`,
    mount(root) {
      // Hero demo: type the query once (respecting reduced motion).
      const el = root.querySelector('.demo__typed'); if (!el) return;
      const text = el.dataset.typed;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; root.querySelector('.demo')?.classList.add('done'); return; }
      let i = 0;
      const tick = () => {
        if (!root.contains(el)) return;
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(tick, 55); else setTimeout(() => root.querySelector('.demo')?.classList.add('done'), 250);
      };
      setTimeout(tick, 600);
    },
  };
}
