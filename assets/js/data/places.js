// Administrative directory. List must be re-checked against the governorate's official site before any official use.
// No population, area or project figures are stored until an official source is attached.
export const places = [
  { id: 'mansoura', name: 'المنصورة', kind: 'center', capital: true },
  { id: 'talkha', name: 'طلخا', kind: 'center' },
  { id: 'mit-ghamr', name: 'ميت غمر', kind: 'center' },
  { id: 'aga', name: 'أجا', kind: 'center' },
  { id: 'sinbillawin', name: 'السنبلاوين', kind: 'center' },
  { id: 'dikirnis', name: 'دكرنس', kind: 'center' },
  { id: 'minyat-alnasr', name: 'منية النصر', kind: 'center' },
  { id: 'manzala', name: 'المنزلة', kind: 'center' },
  { id: 'gamaliya', name: 'الجمالية', kind: 'center' },
  { id: 'sherbin', name: 'شربين', kind: 'center' },
  { id: 'belqas', name: 'بلقاس', kind: 'center' },
  { id: 'tamay', name: 'تمي الأمديد', kind: 'center' },
  { id: 'bani-ebeid', name: 'بني عبيد', kind: 'center' },
  { id: 'nabaroh', name: 'نبروه', kind: 'center' },
  { id: 'mahallet-demna', name: 'محلة دمنة', kind: 'center' },
  { id: 'matariya', name: 'المطرية', kind: 'center' },
  { id: 'kurdi', name: 'الكردي', kind: 'center' },
  { id: 'mit-salsil', name: 'ميت سلسيل', kind: 'center' },
  { id: 'gamasa', name: 'جمصة', kind: 'center', coastal: true },
  { id: 'new-mansoura', name: 'المنصورة الجديدة', kind: 'new-city', agency: 'new-mansoura' },
];

export const PLACE_KIND = { center: 'مركز ومدينة', 'new-city': 'مدينة جديدة' };
