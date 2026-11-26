// Projects map data.
// ⚠ ALL records below are DEMO DATA, generated only to demonstrate the map UI.
// Names are generic examples on purpose (no real project names, budgets, progress % or dates of execution).
// Real records must replace them with: official name, exact location, responsible agency, verified status,
// last official update and a source URL (status: 'verified').
import { CENTER_COORDS } from './geo.js';

export const sectors = [
  { id: 'roads', title: 'طرق ونقل', color: '#475569', icon: 'car' },
  { id: 'water', title: 'مياه وصرف صحي', color: '#0369a1', icon: 'water' },
  { id: 'health', title: 'صحة', color: '#be123c', icon: 'health' },
  { id: 'education', title: 'تعليم', color: '#7c3aed', icon: 'book' },
  { id: 'electricity', title: 'كهرباء', color: '#d97706', icon: 'bolt' },
  { id: 'youth', title: 'شباب ورياضة', color: '#15803d', icon: 'heart' },
];

export const projectStatuses = [
  { id: 'planned', title: 'مخطط' },
  { id: 'ongoing', title: 'جاري التنفيذ' },
  { id: 'done', title: 'مكتمل' },
];

// Which agency is shown as responsible per sector (agencies exist in catalog.js).
const AGENCY = { roads: 'local-units', water: 'water', health: 'health-dir', education: 'edu-dir', electricity: 'electricity', youth: 'youth-dir' };

// Generic example titles per sector — clearly marked as examples.
const TITLE = {
  roads: ['رفع كفاءة طريق محلي', 'تطوير تقاطع مروري', 'رصف شوارع داخلية'],
  water: ['محطة مياه شرب', 'شبكة صرف صحي لقرية', 'إحلال وتجديد خطوط مياه'],
  health: ['تطوير وحدة صحية', 'رفع كفاءة قسم طوارئ', 'إنشاء مركز طب أسرة'],
  education: ['إنشاء مدرسة', 'إضافة فصول دراسية', 'رفع كفاءة مدرسة قائمة'],
  electricity: ['تطوير شبكة الجهد المنخفض', 'إنارة طريق رئيسي', 'محول كهرباء جديد'],
  youth: ['تطوير مركز شباب', 'ملعب خماسي', 'رفع كفاءة صالة متعددة'],
};

// [place, sector, titleIndex, status, hayaKarima?, offset index]
const ROWS = [
  ['mansoura', 'roads', 1, 'ongoing'], ['mansoura', 'health', 1, 'done'], ['mansoura', 'education', 2, 'planned'], ['mansoura', 'youth', 0, 'done'],
  ['talkha', 'water', 2, 'ongoing'], ['talkha', 'electricity', 1, 'done'],
  ['mit-ghamr', 'water', 0, 'ongoing'], ['mit-ghamr', 'education', 0, 'planned'], ['mit-ghamr', 'health', 2, 'ongoing', true],
  ['aga', 'water', 1, 'ongoing', true], ['aga', 'roads', 2, 'done'],
  ['sinbillawin', 'health', 0, 'done', true], ['sinbillawin', 'youth', 1, 'planned'],
  ['dikirnis', 'education', 1, 'ongoing'], ['dikirnis', 'electricity', 0, 'ongoing', true],
  ['minyat-alnasr', 'water', 1, 'planned', true],
  ['manzala', 'roads', 0, 'ongoing'], ['manzala', 'water', 0, 'done'],
  ['gamaliya', 'health', 0, 'ongoing', true],
  ['sherbin', 'education', 0, 'done'], ['sherbin', 'roads', 2, 'planned'],
  ['belqas', 'water', 1, 'ongoing', true], ['belqas', 'youth', 0, 'ongoing'],
  ['tamay', 'electricity', 0, 'done', true],
  ['bani-ebeid', 'education', 1, 'planned', true],
  ['nabaroh', 'health', 2, 'done'],
  ['mahallet-demna', 'water', 1, 'ongoing', true],
  ['matariya', 'roads', 0, 'planned'],
  ['kurdi', 'youth', 1, 'done', true],
  ['mit-salsil', 'water', 2, 'planned'],
  ['gamasa', 'roads', 1, 'ongoing'], ['gamasa', 'electricity', 1, 'done'],
  ['new-mansoura', 'education', 0, 'ongoing'], ['new-mansoura', 'water', 0, 'planned'],
];

const OFF = [[0.012, 0.01], [-0.011, 0.013], [0.009, -0.014], [-0.013, -0.009]];
const UPDATED = ['2026-09-14', '2026-10-02', '2026-10-21', '2026-11-08'];

export const projects = ROWS.map(([place, sector, ti, status, hk], i) => {
  const same = ROWS.slice(0, i).filter((r) => r[0] === place).length;
  const [lat, lng] = CENTER_COORDS[place];
  const [dy, dx] = OFF[same % OFF.length];
  return {
    id: `demo-${String(i + 1).padStart(2, '0')}`,
    name: `${TITLE[sector][ti]} (مثال)`,
    sector, place, status, hayaKarima: !!hk,
    agency: AGENCY[sector],
    lat: +(lat + dy).toFixed(4), lng: +(lng + dx).toFixed(4),
    description: 'وصف توضيحي لمشروع تجريبي يبيّن شكل البطاقة: الهدف من المشروع، والنطاق الجغرافي المستفيد، والجهة المسؤولة. يُستبدل بالوصف الرسمي عند توفر البيانات.',
    updated: UPDATED[i % UPDATED.length],
    data: 'demo',
  };
});
