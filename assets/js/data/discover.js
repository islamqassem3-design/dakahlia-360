// Discover Dakahlia & Invest: content data.
// Rule: every fact here is short, qualitative, and backed by at least one cited source (searched 2026-11-26).
// No prices, opening hours, visitor numbers, budgets or areas are stated (they change and need official confirmation).
// kind: official = government/official body · press = news outlet · reference = encyclopedia/academic.

const S = {
  akhbar_ibnluqman: { name: 'أخبار اليوم: حكاية دار ابن لقمان', url: 'https://m.akhbarelyom.com/news/newdetails/4858143/1/', kind: 'press' },
  jarida_ibnluqman: { name: 'الجريدة: دار ابن لقمان', url: 'https://www.aljarida.com/articles/1462439293748171400', kind: 'press' },
  marefa_mendes: { name: 'المعرفة: منديس', url: 'https://www.marefa.org/%D9%85%D9%86%D8%AF%D9%8A%D8%B3', kind: 'reference' },
  ahram_rub3: { name: 'بوابة الأهرام: تل الربع', url: 'https://gate.ahram.org.eg/Search/تل-الربع.aspx', kind: 'press' },
  wiki_balamun: { name: 'Wikipedia: Tell el-Balamun', url: 'https://en.wikipedia.org/wiki/Tell_el-Balamun', kind: 'reference' },
  bawaba_balamun: { name: 'البوابة نيوز: تل البلامون', url: 'https://www.albawabhnews.com/4274010', kind: 'press' },
  marefa_gamasa: { name: 'المعرفة: جمصة', url: 'https://www.marefa.org/%D8%AC%D9%85%D8%B5%D8%A9', kind: 'reference' },
  telegraph_gamasa: { name: 'تلغراف مصر: شاطئ جمصة', url: 'https://www.egypttelegraph.com/article/240807/', kind: 'press' },
  watan_newmansoura: { name: 'الوطن: مستجدات المنصورة الجديدة', url: 'https://www.elwatannews.com/news/details/6105013', kind: 'press' },
  nuca: { name: 'هيئة المجتمعات العمرانية الجديدة', url: 'http://www.newcities.gov.eg', kind: 'official' },
  nmu: { name: 'جامعة المنصورة الجديدة', url: 'https://www.nmu.edu.eg/ar', kind: 'official' },
  mans: { name: 'جامعة المنصورة', url: 'https://www.mans.edu.eg', kind: 'official' },
  wiki_manzala: { name: 'Wikipedia: Lake Manzala', url: 'https://en.wikipedia.org/wiki/Lake_Manzala', kind: 'reference' },
  wiki_mansoura: { name: 'Wikipedia: Mansoura', url: 'https://en.wikipedia.org/wiki/Mansoura,_Egypt', kind: 'reference' },
  ahram_rice: { name: 'بوابة الأهرام: الدقهلية والأرز', url: 'https://gate.ahram.org.eg/News/1811131.aspx', kind: 'press' },
  ahram_gamasa_ind: { name: 'بوابة الأهرام: المنطقة الصناعية بجمصة', url: 'https://gate.ahram.org.eg/News/2065927.aspx', kind: 'press' },
  youm7_gamasa_ind: { name: 'اليوم السابع: المخطط التفصيلي لصناعية جمصة', url: 'https://www.youm7.com/6451133', kind: 'press' },
  ida: { name: 'الهيئة العامة للتنمية الصناعية', url: 'https://www.ida.gov.eg/ar', kind: 'official' },
  madein: { name: 'منصة مصر الصناعية الرقمية', url: 'https://madein.eg', kind: 'official' },
  gafi: { name: 'الهيئة العامة للاستثمار والمناطق الحرة', url: 'https://www.gafi.gov.eg/ar', kind: 'official' },
  investinegypt: { name: 'منصة Invest in Egypt', url: 'https://www.investinegypt.gov.eg', kind: 'official' },
  mota: { name: 'وزارة السياحة والآثار', url: 'https://mota.gov.eg/ar/', kind: 'official' },
  idsc_profile: { name: 'مركز المعلومات ودعم اتخاذ القرار: ملف محافظة الدقهلية', url: 'https://idsc.gov.eg/upload/7%20years/government/pdf/07%20%D9%85%D8%AD%D8%A7%D9%81%D8%B8%D8%A9%20%D8%A7%D9%84%D8%AF%D9%82%D9%87%D9%84%D9%8A%D8%A9.pdf', kind: 'official' },
};
export const discoverSources = S;
export const SOURCE_KIND = { official: 'مصدر رسمي', press: 'مصدر صحفي', reference: 'مرجع موسوعي' };

export const poiCats = [
  { id: 'heritage', title: 'تاريخ وآثار', icon: 'building', tone: '#9a6b2f' },
  { id: 'coast', title: 'ساحل وطبيعة', icon: 'compass', tone: '#0f6f8a' },
  { id: 'knowledge', title: 'تعليم ومعرفة', icon: 'book', tone: '#5b3fa0' },
];

// lat/lng are approximate (OpenStreetMap or town-level) and are labelled as such in the UI.
export const pois = [
  {
    id: 'dar-ibn-luqman', cat: 'heritage', place: 'mansoura', lat: 31.0446, lng: 31.3836,
    name: 'دار ابن لقمان',
    short: 'الدار التي احتُجز فيها لويس التاسع ملك فرنسا بعد هزيمة الحملة الصليبية السابعة، وبجوارها متحف.',
    body: 'تُنسب الدار إلى القاضي فخر الدين ابن لقمان في العصر الأيوبي. وبحسب المصادر، احتُجز فيها الملك الفرنسي لويس التاسع بعد هزيمة الحملة الصليبية السابعة، ويضم الموقع اليوم الدار القديمة ومتحفًا يروي أحداث المعركة.',
    sources: ['akhbar_ibnluqman', 'jarida_ibnluqman'],
  },
  {
    id: 'mendes', cat: 'heritage', place: 'tamay', lat: 30.9562, lng: 31.517,
    name: 'تل الربع (منديس)',
    short: 'موقع مدينة منديس المصرية القديمة، من أهم المناطق الأثرية في الدقهلية.',
    body: 'تل الربع هو موقع مدينة منديس القديمة بمركز تمي الأمديد. يحتاج الموقع إلى تنسيق مسبق مع الجهات المختصة قبل الزيارة، وتشير تقارير إلى مخاطر في بعض أجزائه.',
    sources: ['marefa_mendes', 'ahram_rub3'],
  },
  {
    id: 'balamun', cat: 'heritage', place: 'sherbin', lat: 31.2598, lng: 31.5731,
    name: 'تل البلامون',
    short: 'مدينة قديمة كانت عاصمة لأحد أقاليم مصر السفلى، وتضم بقايا مجمع معابد.',
    body: 'يقع تل البلامون في نطاق مركز شربين، ويُعرف في المصادر اليونانية باسم ديوسبوليس بارفا. أُجريت فيه حفائر من بعثات مختلفة منها جامعة المنصورة.',
    sources: ['wiki_balamun', 'bawaba_balamun'],
  },
  {
    id: 'gamasa-beach', cat: 'coast', place: 'gamasa', lat: 31.4475, lng: 31.5300,
    name: 'شاطئ جمصة',
    short: 'مصيف على البحر المتوسط، من أقرب المصايف لمحافظات وسط الدلتا.',
    body: 'جمصة مدينة ساحلية على البحر المتوسط، ومصيف شعبي يقصده سكان الدلتا والمحافظات المجاورة، وتشهد أعمال تطوير لرفع كفاءتها.',
    sources: ['marefa_gamasa', 'telegraph_gamasa'],
  },
  {
    id: 'new-mansoura-corniche', cat: 'coast', place: 'new-mansoura', lat: 31.4590, lng: 31.4420,
    name: 'كورنيش المنصورة الجديدة',
    short: 'واجهة ساحلية لمدينة جديدة على الطريق الساحلي الدولي.',
    body: 'تقع المنصورة الجديدة على الطريق الساحلي الدولي بجوار جمصة، ويُعد الكورنيش من أبرز معالمها.',
    sources: ['watan_newmansoura', 'nuca'],
  },
  {
    id: 'manzala-lake', cat: 'coast', place: 'matariya', lat: 31.2200, lng: 32.0300,
    name: 'بحيرة المنزلة',
    short: 'من أكبر البحيرات الشمالية في مصر، ويرتبط بها نشاط الصيد في المطرية والمنزلة.',
    body: 'تمتد بحيرة المنزلة عبر عدة محافظات منها الدقهلية، ويرتبط بها نشاط الصيد في مدن مثل المطرية.',
    sources: ['wiki_manzala'],
  },
  {
    id: 'nile-mansoura', cat: 'coast', place: 'mansoura', lat: 31.0460, lng: 31.3700,
    name: 'النيل في المنصورة',
    short: 'تقع المنصورة على فرع دمياط من نهر النيل، وتقابلها طلخا على الضفة الأخرى.',
    body: 'المنصورة عاصمة محافظة الدقهلية، وتقع على الضفة الشرقية لفرع دمياط من نهر النيل.',
    sources: ['wiki_mansoura'],
  },
  {
    id: 'mansoura-university', cat: 'knowledge', place: 'mansoura', lat: 31.0407, lng: 31.3581,
    name: 'جامعة المنصورة',
    short: 'جامعة حكومية رئيسية في المحافظة.',
    body: 'جامعة المنصورة من الجامعات الحكومية الكبرى في دلتا مصر، ومقرها مدينة المنصورة.',
    sources: ['mans'],
  },
  {
    id: 'nmu', cat: 'knowledge', place: 'new-mansoura', lat: 31.4606, lng: 31.4559,
    name: 'جامعة المنصورة الجديدة',
    short: 'جامعة في مدينة المنصورة الجديدة على الطريق الساحلي.',
    body: 'جامعة المنصورة الجديدة تقع بمدينة المنصورة الجديدة على الطريق الساحلي الدولي.',
    sources: ['nmu', 'watan_newmansoura'],
  },
];

// Short sourced profiles for the featured cities (brief: Mansoura, New Mansoura, Gamasa).
export const profiles = {
  mansoura: { tag: 'عاصمة المحافظة على النيل', text: 'عاصمة محافظة الدقهلية على فرع دمياط من النيل، ومركز للتعليم والخدمات في وسط الدلتا، وترتبط تاريخيًا بمعركة المنصورة ودار ابن لقمان.', sources: ['wiki_mansoura', 'akhbar_ibnluqman'], tone: '#131209', accent: '#14b8a6' },
  'new-mansoura': { tag: 'مدينة جديدة على المتوسط', text: 'مدينة جديدة تتبع هيئة المجتمعات العمرانية الجديدة، على الطريق الساحلي الدولي بجوار جمصة، وتضم جامعة المنصورة الجديدة.', sources: ['nuca', 'watan_newmansoura'], tone: '#1F1F1F', accent: '#38bdf8' },
  gamasa: { tag: 'مصيف الدلتا على البحر', text: 'مدينة ساحلية ومصيف على البحر المتوسط، وبها منطقة صناعية تتابعها المحافظة والهيئة العامة للتنمية الصناعية.', sources: ['marefa_gamasa', 'ahram_gamasa_ind'], tone: '#272727', accent: '#c9a45c' },
};

// Economic features: qualitative only, each with a source.
export const economy = [
  { id: 'agri', icon: 'basket', title: 'الزراعة', text: 'الدقهلية من أكبر محافظات مصر في زراعة الأرز.', sources: ['ahram_rice'] },
  { id: 'industry', icon: 'building', title: 'المنطقة الصناعية بجمصة', text: 'منطقة صناعية قائمة تتابعها المحافظة مع الهيئة العامة للتنمية الصناعية، وتُطرح الأراضي الصناعية حاليًا عبر منصة مصر الصناعية الرقمية.', sources: ['ahram_gamasa_ind', 'youm7_gamasa_ind', 'madein'] },
  { id: 'fish', icon: 'compass', title: 'الصيد والثروة السمكية', text: 'يرتبط نشاط الصيد ببحيرة المنزلة في مدن مثل المطرية.', sources: ['wiki_manzala'] },
  { id: 'urban', icon: 'pin', title: 'عمران جديد على الساحل', text: 'مدينة المنصورة الجديدة على الطريق الساحلي الدولي تتبع هيئة المجتمعات العمرانية الجديدة.', sources: ['nuca', 'watan_newmansoura'] },
  { id: 'knowledge', icon: 'book', title: 'التعليم والصحة', text: 'وجود جامعتي المنصورة والمنصورة الجديدة يجعل المحافظة مركزًا للتعليم الجامعي في الدلتا.', sources: ['mans', 'nmu'] },
];

// Investment path: guidance to official channels (not an official procedure).
export const investSteps = [
  { t: 'حدد النشاط والقطاع', d: 'صناعي، زراعي، سياحي، خدمي… لأن القطاع يحدد الجهة المختصة والاشتراطات.', links: ['investinegypt'] },
  { t: 'اختر نوع الموقع', d: 'منطقة صناعية، مدينة جديدة، أو داخل الكتلة العمرانية.', links: [] },
  { t: 'الأرض من القناة الرسمية', d: 'الأراضي الصناعية تُطرح عبر منصة مصر الصناعية الرقمية، وأراضي المدن الجديدة عبر هيئة المجتمعات العمرانية.', links: ['madein', 'ida', 'nuca'] },
  { t: 'تأسيس الكيان القانوني', d: 'تأسيس الشركة وخدمات المستثمرين لدى الهيئة العامة للاستثمار.', links: ['gafi'], svc: 'company-setup' },
  { t: 'السجل والتسجيل الضريبي والتراخيص', d: 'استكمال السجل التجاري والبطاقة الضريبية وتراخيص التشغيل.', links: [], svc: 'commercial-register' },
];
