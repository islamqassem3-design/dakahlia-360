// Categories are organised by what the citizen wants to get done, not by agency names.
export const categories = [
  { id: 'civil', title: 'الوثائق والأحوال المدنية', hint: 'بطاقة، ميلاد، زواج، وفاة', icon: 'id' },
  { id: 'traffic', title: 'المرور والمركبات', hint: 'رخص القيادة والسيارات والمخالفات', icon: 'car' },
  { id: 'business', title: 'نشاط تجاري وترخيص', hint: 'رخصة محل، سجل تجاري، بطاقة ضريبية', icon: 'store' },
  { id: 'building', title: 'البناء والعقارات', hint: 'تراخيص البناء والتصالح', icon: 'building' },
  { id: 'social', title: 'الدعم والحماية الاجتماعية', hint: 'تكافل وكرامة والخدمات الاجتماعية', icon: 'heart' },
  { id: 'work', title: 'العمل والتأمينات', hint: 'التأمينات والمعاشات والتوظيف', icon: 'briefcase' },
  { id: 'utilities', title: 'الكهرباء والمياه', hint: 'أعطال، فواتير، توصيل', icon: 'bolt' },
  { id: 'health', title: 'الصحة', hint: 'العلاج والطوارئ', icon: 'health' },
  { id: 'education', title: 'التعليم', hint: 'المدارس والنتائج', icon: 'book' },
  { id: 'supply', title: 'التموين', hint: 'بطاقات التموين والدعم', icon: 'basket' },
  { id: 'invest', title: 'الاستثمار وتأسيس الشركات', hint: 'تأسيس شركة والجهات الاستثمارية', icon: 'chart' },
  { id: 'complaints', title: 'الشكاوى والاستفسارات', hint: 'القناة الرسمية الصحيحة لشكواك', icon: 'chat' },
];

// Agencies. Addresses/phones are intentionally empty until confirmed from an official source.
// scope: 'local' = داخل المحافظة، 'national' = جهة قومية تُقدَّم خدماتها لسكان المحافظة.
export const agencies = [
  { id: 'gov', name: 'ديوان عام محافظة الدقهلية', scope: 'local', type: 'المحافظة', source: 'dakahlia', about: 'الجهة الإدارية العليا بالمحافظة، وتتبعها الوحدات المحلية للمراكز والمدن والأحياء.' },
  { id: 'local-units', name: 'الوحدات المحلية للمراكز والمدن والأحياء', scope: 'local', type: 'الإدارة المحلية', source: 'dakahlia', about: 'الجهة الأقرب للمواطن في ملفات المحال والبناء والمرافق المحلية داخل كل مركز ومدينة.' },
  { id: 'health-dir', name: 'مديرية الشؤون الصحية بالدقهلية', scope: 'local', type: 'مديرية', source: 'mohp', about: 'تتبع وزارة الصحة والسكان، وتشرف على المستشفيات والوحدات الصحية بالمحافظة.' },
  { id: 'edu-dir', name: 'مديرية التربية والتعليم بالدقهلية', scope: 'local', type: 'مديرية', source: 'moe', about: 'تتبع وزارة التربية والتعليم، وتشرف على الإدارات التعليمية والمدارس بالمحافظة.' },
  { id: 'social-dir', name: 'مديرية التضامن الاجتماعي بالدقهلية', scope: 'local', type: 'مديرية', source: 'moss', about: 'تتبع وزارة التضامن الاجتماعي، وتقدم برامج الدعم والحماية الاجتماعية عبر الوحدات الاجتماعية.' },
  { id: 'supply-dir', name: 'مديرية التموين والتجارة الداخلية بالدقهلية', scope: 'local', type: 'مديرية', source: 'digital', about: 'تتبع وزارة التموين والتجارة الداخلية، وتختص بملفات بطاقات التموين والرقابة على الأسواق.' },
  { id: 'labor-dir', name: 'مديرية العمل بالدقهلية', scope: 'local', type: 'مديرية', source: 'manpower', about: 'تتبع وزارة العمل، وتختص بخدمات التشغيل وشؤون العمال.' },
  { id: 'youth-dir', name: 'مديرية الشباب والرياضة بالدقهلية', scope: 'local', type: 'مديرية', source: 'emys', about: 'تتبع وزارة الشباب والرياضة، وتشرف على مراكز الشباب والأنشطة الرياضية.' },
  { id: 'water', name: 'شركة مياه الشرب والصرف الصحي بالدقهلية', scope: 'local', type: 'شركة خدمية', source: 'hcww', about: 'شركة تابعة للشركة القابضة لمياه الشرب والصرف الصحي، تختص بخدمات المياه والصرف داخل المحافظة.' },
  { id: 'electricity', name: 'شركة شمال الدلتا لتوزيع الكهرباء', scope: 'local', type: 'شركة خدمية', source: 'eehc', about: 'إحدى شركات توزيع الكهرباء التابعة للشركة القابضة لكهرباء مصر، وتخدم نطاقًا يشمل الدقهلية.' },
  { id: 'new-mansoura', name: 'جهاز تنمية مدينة المنصورة الجديدة', scope: 'local', type: 'جهاز مدينة جديدة', source: 'nuca', about: 'يتبع هيئة المجتمعات العمرانية الجديدة، ويختص بخدمات مدينة المنصورة الجديدة.' },
  { id: 'civil-status', name: 'قطاع الأحوال المدنية', scope: 'national', type: 'وزارة الداخلية', source: 'moi', about: 'الجهة المختصة بوثائق الرقم القومي والميلاد والزواج والوفاة، ولها مكاتب داخل المحافظة.' },
  { id: 'traffic', name: 'الإدارة العامة للمرور', scope: 'national', type: 'وزارة الداخلية', source: 'ppo', about: 'تختص برخص القيادة وتراخيص المركبات، ولها وحدات مرور داخل المحافظة.' },
  { id: 'tax', name: 'مصلحة الضرائب المصرية', scope: 'national', type: 'وزارة المالية', source: 'eta', about: 'الجهة المختصة بالتسجيل الضريبي والبطاقة الضريبية.' },
  { id: 'nosi', name: 'الهيئة القومية للتأمين الاجتماعي', scope: 'national', type: 'هيئة', source: 'nosi', about: 'الجهة المختصة بالتأمينات والمعاشات، ولها مكاتب داخل المحافظة.' },
  { id: 'gafi', name: 'الهيئة العامة للاستثمار والمناطق الحرة', scope: 'national', type: 'هيئة', source: 'gafi', about: 'الجهة المختصة بتأسيس الشركات وخدمات المستثمرين.' },
  { id: 'shakwa', name: 'منظومة الشكاوى الحكومية الموحدة', scope: 'national', type: 'مجلس الوزراء', source: 'shakwa', about: 'القناة الرسمية الموحدة لتقديم الشكاوى ومتابعتها مع الجهات الحكومية.' },
  { id: 'digital', name: 'بوابة مصر الرقمية', scope: 'national', type: 'منصة رقمية', source: 'digital', about: 'المنصة الرسمية لتقديم عدد من الخدمات الحكومية إلكترونيًا.' },
];

// Emergency & hotline numbers. status unverified until confirmed by the governorate.
export const hotlines = [
  { n: '122', label: 'شرطة النجدة' },
  { n: '123', label: 'الإسعاف' },
  { n: '180', label: 'المطافئ' },
  { n: '121', label: 'طوارئ الكهرباء' },
  { n: '125', label: 'خدمة عملاء المياه والصرف' },
  { n: '129', label: 'طوارئ الغاز' },
  { n: '16528', label: 'منظومة الشكاوى الحكومية' },
];
