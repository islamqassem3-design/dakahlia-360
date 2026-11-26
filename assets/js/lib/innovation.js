// Innovation & Project Development layer (add-only).
// Storage: browser localStorage (no backend). Intelligence: transparent rule-based simulation, NOT a connected AI
// and NOT field research. Every generated text is a draft the user edits.
import { sectorsIdeas, HORIZON } from '../data/ideas.js?v=202611261622';
import { projects, sectors as projSectors } from '../data/projects.js?v=202611261622';
import { places } from '../data/places.js?v=202611261622';
import { agencies } from '../data/catalog.js?v=202611261622';
import { normalize, tokens } from './search.js?v=202611261622';

export const SIM_NOTE = 'محاكاة قائمة على قواعد (Demo)، ليست ذكاءً اصطناعيًا متصلًا ولا دراسة ميدانية. راجع وعدّل.';

// ---------- sectors registry (catalog sectors + Idea Lab sectors) ----------
const LAB_EXTRA = [
  { id: 'environment', title: 'البيئة', icon: 'leaf' },
  { id: 'cleanliness', title: 'النظافة', icon: 'trash' },
  { id: 'urban', title: 'التنمية العمرانية', icon: 'city' },
  { id: 'infra', title: 'البنية التحتية', icon: 'wrench' },
  { id: 'tech', title: 'التكنولوجيا', icon: 'cpu' },
  { id: 'pm', title: 'إدارة المشروعات', icon: 'kanban' },
];
export const SECTORS = [...sectorsIdeas.map(({ id, title, icon }) => ({ id, title, icon })), ...LAB_EXTRA];
export const sectorById = Object.fromEntries(SECTORS.map((s) => [s.id, s]));
export const LAB_SECTORS = ['services', 'roads', 'health', 'education', 'environment', 'cleanliness', 'tourism', 'invest', 'urban', 'infra', 'tech', 'pm'];

export const STAGES = [
  { id: 'idea', t: 'فكرة', d: 'فكرة أولية' },
  { id: 'dev', t: 'قيد التطوير', d: 'الفكرة قيد التحليل والتطوير' },
  { id: 'proto', t: 'لديها نموذج', d: 'تم إنشاء نموذج تجريبي' },
  { id: 'ready', t: 'جاهزة للعرض', d: 'مكتملة وجاهزة للعرض' },
];
export const stageById = Object.fromEntries(STAGES.map((s) => [s.id, s]));

// ---------- storage ----------
const K = { custom: 'd360.ideas.custom', ws: 'd360.ideas.ws', dec: 'd360.ideas.decisions' };
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const BASE = sectorsIdeas.flatMap((s) => s.ideas.map((i, n) => ({ ...i, id: `${s.id}-${n + 1}`, sector: s.id, origin: 'catalog' })));

export function allIdeas() { return [...BASE, ...load(K.custom, [])]; }
export function getIdea(id) { return allIdeas().find((i) => i.id === id); }
export function getWS(id) { return load(K.ws, {})[id] || {}; }
export function saveWS(id, patch) {
  const all = load(K.ws, {}); const cur = all[id] || {};
  all[id] = { ...cur, ...patch, updated: new Date().toISOString().slice(0, 10) }; save(K.ws, all); return all[id];
}
export const stageOf = (id) => getWS(id).stage || 'idea';
export function setStage(id, stage) { saveWS(id, { stage }); }
export function addIdea(idea) {
  const list = load(K.custom, []);
  const id = `lab-${Date.now().toString(36)}`;
  const rec = { hz: 'mid', n: 'يُحدد لاحقًا', ...idea, id, origin: 'lab', created: new Date().toISOString().slice(0, 10) };
  list.push(rec); save(K.custom, list); return rec;
}
export function removeCustom(id) { save(K.custom, load(K.custom, []).filter((i) => i.id !== id)); }
export const decisions = () => load(K.dec, {});
export function decide(key, v) { const d = decisions(); d[key] = v; save(K.dec, d); }

// ---------- links: idea ↔ project ----------
const PROJ_TO_IDEA_SECTOR = { roads: ['roads'], water: ['utilities', 'infra'], electricity: ['utilities', 'infra'], health: ['health'], education: ['education'], youth: ['tourism'] };
export function linkProject(ideaId, projectId) { const ws = getWS(ideaId); const l = new Set(ws.projects || []); l.add(projectId); saveWS(ideaId, { projects: [...l] }); }
export function unlinkProject(ideaId, projectId) { const ws = getWS(ideaId); saveWS(ideaId, { projects: (ws.projects || []).filter((p) => p !== projectId) }); }
export const linkedProjects = (ideaId) => (getWS(ideaId).projects || []).map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);
export const ideasLinkedTo = (projectId) => allIdeas().filter((i) => (getWS(i.id).projects || []).includes(projectId));
export const suggestedProjectsFor = (idea) => projects.filter((p) => (PROJ_TO_IDEA_SECTOR[p.sector] || []).includes(idea.sector));

// ---------- scoring ----------
export const CRITERIA = [
  { id: 'size', t: 'حجم المشكلة', w: 25 },
  { id: 'impact', t: 'الأثر على المواطن', w: 25 },
  { id: 'ease', t: 'سهولة التنفيذ', w: 20 },
  { id: 'value', t: 'التكلفة مقابل العائد', w: 15 },
  { id: 'scale', t: 'قابلية التوسع', w: 15 },
];
const SECTOR_WEIGHT = { services: 5, complaints: 4, health: 5, education: 4, roads: 4, utilities: 5, agri: 3, tourism: 3, invest: 3, gov: 3, environment: 4, cleanliness: 4, urban: 3, infra: 4, tech: 3, pm: 3 };
export function defaultScores(idea) {
  const w = SECTOR_WEIGHT[idea.sector] || 3;
  const ease = { quick: 5, mid: 3, long: 2 }[idea.hz] || 3;
  const val = { quick: 4, mid: 3, long: 3 }[idea.hz] || 3;
  const scale = /خريطة|لوحة|دليل|منظومة|منصة|رقم/.test(idea.t + idea.h) ? 4 : 3;
  return { size: w, impact: Math.min(5, w + (idea.hz === 'long' ? 0 : 0)), ease, value: val, scale };
}
export function scoresOf(idea) { return { ...defaultScores(idea), ...(getWS(idea.id).scores || {}) }; }
export function evaluate(idea, sc = scoresOf(idea)) {
  const total = Math.round(CRITERIA.reduce((n, c) => n + (sc[c.id] / 5) * c.w, 0));
  const level = total >= 75 ? 'عالية' : total >= 55 ? 'متوسطة' : 'منخفضة';
  const quick = sc.ease >= 4 && total >= 60;
  const strategic = sc.size >= 4 && sc.scale >= 4 && sc.ease <= 3;
  const protoWorthy = total >= 60 && sc.impact >= 3;
  const strengths = CRITERIA.filter((c) => sc[c.id] >= 4).map((c) => c.t);
  const weak = CRITERIA.filter((c) => sc[c.id] <= 2).map((c) => c.t);
  const risks = [idea.n && `الاعتماد على: ${idea.n}`, idea.hz === 'long' && 'يحتاج ربطًا رسميًا أو بنية تحتية قبل التشغيل', sc.ease <= 2 && 'صعوبة تنفيذ قد تطيل المدة'].filter(Boolean);
  const reason = `المجموع ${total}/100 من أوزان: ${CRITERIA.map((c) => `${c.t} ${sc[c.id]}/5`).join('، ')}.`;
  const rec = quick ? 'ابدأ بها كمكسب سريع بنموذج تجريبي في مركز واحد، ثم قيّم وعمّم.'
    : protoWorthy ? 'تستحق نموذجًا تجريبيًا لإثبات القيمة قبل طلب الموارد الكاملة.'
    : strategic ? 'فكرة استراتيجية: تُدرج في خطة متوسطة المدى بعد تأمين البيانات والصلاحيات.'
    : 'تحتاج مزيدًا من التطوير وجمع المعلومات قبل البدء.';
  const readiness = total >= 75 ? 'مناسبة للبدء' : total >= 55 ? 'مناسبة بعد استكمال التطوير' : 'غير جاهزة بعد';
  return { total, level, quick, strategic, protoWorthy, strengths, weak, risks, reason, rec, readiness };
}

// ---------- relations & merging ----------
const STOP = new Set(tokens('فكره مشروع منظومه خدمه خدمات المواطن الجهات الجهه لكل حسب مع من في على'));
const sig = (i) => new Set(tokens(`${i.t} ${i.p} ${i.h}`).filter((t) => t.length > 2 && !STOP.has(t)));
export function relatedIdeas(idea, list = allIdeas()) {
  const a = sig(idea);
  return list.filter((x) => x.id !== idea.id).map((x) => {
    const b = sig(x); const shared = [...a].filter((t) => b.has(t));
    let score = shared.length; const why = [];
    if (x.sector === idea.sector) { score += 2; why.push('نفس القطاع'); }
    if (shared.length) why.push(`مفاهيم مشتركة: ${shared.slice(0, 3).join('، ')}`);
    const kind = x.sector === idea.sector && shared.length >= 2 ? 'مشابهة' : x.sector !== idea.sector && shared.length ? 'مكمّلة' : 'مرتبطة';
    return { x, score, why: why.join(' · ') || 'سياق قريب', kind };
  }).filter((r) => r.score >= 2).sort((p, q) => q.score - p.score).slice(0, 5);
}

// Merge themes: suggestions only; never applied automatically.
export const THEMES = [
  { id: 'roads-suite', name: 'منظومة متابعة الطرق والتحويلات', match: (i) => i.sector === 'roads' || /لوحة مؤشرات|بلاغات الشارع/.test(i.t),
    problem: 'أعمال الطرق والتحويلات وبلاغات الشارع تُتابع منفصلة، فلا يرى المواطن ولا المسؤول الصورة الكاملة.',
    parts: ['خريطة مشروعات الطرق', 'متابعة مراحل التنفيذ', 'خريطة التحويلات المرورية', 'تنبيهات للمواطنين', 'لوحة متابعة للمسؤولين'],
    value: 'مصدر واحد لحالة الطرق يقلل المفاجآت للمواطن ويعطي القيادة رؤية موحدة.' },
  { id: 'booking-suite', name: 'منصة المواعيد الموحدة', match: (i) => /حجز|موعد|مواعيد/.test(i.t + i.h),
    problem: 'الزحام والانتظار يتكرر في المراكز التكنولوجية والعيادات بنفس الشكل.',
    parts: ['اختيار الخدمة والجهة', 'حجز موعد', 'تذكير بالمستندات', 'متابعة الدور', 'تقارير الإشغال'],
    value: 'نظام حجز واحد يخدم أكثر من جهة بتجربة موحدة وتكلفة أقل من أنظمة منفصلة.' },
  { id: 'data-suite', name: 'مركز بيانات ومؤشرات المحافظة', match: (i) => /مؤشرات|بيانات مفتوحة|لوحة|تحديث للمحتوى/.test(i.t + i.h),
    problem: 'البيانات موزعة بين الجهات ولا تُستخدم بشكل موحد في القرار أو الإتاحة.',
    parts: ['لوحة مؤشرات للقيادة', 'مؤشرات استجابة معلنة', 'بيانات مفتوحة', 'فريق تحديث المحتوى'],
    value: 'قرار أسرع وشفافية أعلى من نفس البيانات بدل تجميعها كل مرة.' },
  { id: 'utilities-suite', name: 'منصة المرافق والبلاغات', match: (i) => i.sector === 'utilities' || /بلاغ|انقطاع|قناة استفسارات/.test(i.t + i.h),
    problem: 'المواطن لا يعرف مواعيد الانقطاع ولا مسار البلاغ الصحيح.',
    parts: ['إعلان مسبق للانقطاعات', 'بلاغات بالموقع والصورة', 'متابعة مشروعات القرى', 'قناة استفسارات موثقة'],
    value: 'تقليل البلاغات المكررة ورفع ثقة المواطن في الاستجابة.' },
  { id: 'visitor-suite', name: 'الدقهلية للزائر والمستثمر', match: (i) => ['tourism', 'invest'].includes(i.sector),
    problem: 'مقومات المحافظة السياحية والاقتصادية غير معروضة بشكل جذاب وموحد.',
    parts: ['مسارات سياحية رقمية', 'دليل فعاليات', 'خريطة الأراضي الصناعية', 'ملف ترويجي لكل مركز'],
    value: 'واجهة واحدة تعرّف بالمحافظة وتوجّه الزائر والمستثمر للجهة الصحيحة.' },
];
export function mergeSuggestionsFor(idea) {
  const list = allIdeas();
  return THEMES.filter((th) => th.match(idea)).map((th) => ({ ...th, ideas: list.filter((i) => th.match(i)) })).filter((th) => th.ideas.length >= 2);
}
export function allMergeSuggestions() {
  const list = allIdeas();
  return THEMES.map((th) => ({ ...th, ideas: list.filter((i) => th.match(i)) })).filter((th) => th.ideas.length >= 2);
}
export function acceptMerge(theme, ideaIds) {
  const list = allIdeas().filter((i) => ideaIds.includes(i.id));
  const rec = addIdea({
    t: theme.name, sector: list[0]?.sector || 'gov', hz: 'mid',
    p: theme.problem, h: `دمج ${list.length} أفكار في مشروع واحد: ${list.map((i) => i.t).join('، ')}.`,
    n: [...new Set(list.map((i) => i.n))].join('، '), mergedFrom: ideaIds,
  });
  saveWS(rec.id, { stage: 'dev', components: theme.parts.join('\n'), solution: `${theme.value}` });
  decide(`merge:${theme.id}`, 'accepted');
  return rec;
}

// ---------- drafts for the development workspace ----------
const KIT = {
  causes: ['تعدد الجهات وغياب مصدر موحد للمعلومة', 'إجراءات ورقية أو حضورية غير ضرورية', 'غياب قنوات متابعة واضحة للمواطن'],
  affected: ['المواطنون المترددون على الخدمة', 'الموظفون في نقاط تقديم الخدمة', 'متخذو القرار في الجهة'],
  kpis: ['متوسط زمن الوصول للخدمة أو المعلومة', 'نسبة الطلبات المنجزة من أول مرة', 'رضا المستخدم بعد الاستخدام', 'عدد المستخدمين النشطين شهريًا'],
  phases: ['تحليل وتصميم بمشاركة الجهة', 'نموذج تجريبي قابل للتجربة', 'تجربة في مركز واحد وقياس النتائج', 'تعميم تدريجي على المراكز'],
  challenges: ['توفر البيانات المحدثة من الجهات', 'التنسيق بين أكثر من جهة', 'تبني الموظفين والمواطنين للأداة الجديدة'],
  risks: ['تقادم المحتوى إن لم يُكلَّف فريق تحديث', 'ضعف الإقبال دون حملة توعية', 'الاعتماد على تكامل غير مصرح به بعد'],
};
const SECTOR_KPI = {
  roads: ['نسبة الأعمال المعلنة مسبقًا', 'عدد البلاغات المرتبطة بالأعمال'], health: ['متوسط زمن الانتظار في العيادات', 'نسبة الحجز المسبق'],
  education: ['زمن إتمام إجراءات التحويل', 'نسبة الاستفسارات المحلولة رقميًا'], utilities: ['عدد البلاغات المكررة', 'نسبة الانقطاعات المعلنة مسبقًا'],
  services: ['عدد الزيارات المتكررة للخدمة نفسها', 'زمن إنجاز الطلب'], complaints: ['متوسط زمن الاستجابة للبلاغ', 'نسبة البلاغات المغلقة'],
};
const stakeholdersFor = (idea) => {
  const m = { services: ['local-units', 'digital'], complaints: ['shakwa', 'local-units'], health: ['health-dir'], education: ['edu-dir'], roads: ['local-units', 'traffic'], utilities: ['water', 'electricity'], agri: ['gov'], tourism: ['gov', 'youth-dir'], invest: ['gafi', 'gov'], gov: ['gov'] }[idea.sector] || ['gov', 'local-units'];
  return m.map((id) => agencies.find((a) => a.id === id)?.name).filter(Boolean);
};
export function draftFor(idea, key) {
  const sec = sectorById[idea.sector]?.title || '';
  const D = {
    problem: idea.p,
    current: `غير متحقق منه حاليًا. يُستكمل ببيانات من: ${idea.n || 'الجهة المختصة'}.`,
    causes: KIT.causes.join('\n'),
    gap: `لا توجد حاليًا أداة موحدة تعالج: ${idea.p}`,
    affected: KIT.affected.join('\n'),
    stakeholders: stakeholdersFor(idea).join('\n'),
    why: 'لأن المشكلة تتكرر يوميًا وتؤثر على ثقة المواطن وكفاءة الجهة، ويمكن معالجة جزء منها رقميًا بتكلفة محدودة.',
    solution: idea.h,
    how: `يعمل الحل كطبقة رقمية فوق الإجراءات الحالية في قطاع ${sec}: يجمع المعلومة من الجهة، ويعرضها للمواطن، ويتيح المتابعة.`,
    usage: 'المواطن يدخل من الموبايل أو الموقع، يختار ما يحتاجه، ويحصل على النتيجة أو يتابع حالته دون زيارة.',
    components: ['واجهة للمواطن (موقع وموبايل)', 'لوحة إدارة للجهة', 'قاعدة بيانات محدثة', 'تنبيهات ورسائل'].join('\n'),
    journey: ['يكتشف المواطن الخدمة من البوابة أو المساعد', 'يختار المركز والخدمة', 'ينفذ الإجراء أو يقدم الطلب', 'يتابع الحالة ويستلم تنبيهًا', 'يقيّم التجربة'].join('\n'),
    partners: stakeholdersFor(idea).join('\n'),
    pname: `مشروع ${idea.t}`,
    pdesc: `${idea.h} ضمن منظومة Dakahlia 360°.`,
    goals: ['تقليل الوقت والجهد على المواطن', 'رفع كفاءة الجهة المختصة', 'توفير بيانات تدعم القرار'].join('\n'),
    beneficiaries: KIT.affected.join('\n'),
    reqs: [idea.n, 'فريق تشغيل وتحديث من الجهة', 'موافقات النشر والصلاحيات'].filter(Boolean).join('\n'),
    phases: KIT.phases.join('\n'),
    challenges: KIT.challenges.join('\n'),
    risks: KIT.risks.join('\n'),
    kpis: [...(SECTOR_KPI[idea.sector] || []), ...KIT.kpis.slice(0, 2)].join('\n'),
    cx_level: 'متوسط',
    cx_notes: 'تجربة أوضح ووصول أسهل للمعلومة وتقليل الزيارات غير الضرورية. الوقت الموفر يُقاس فعليًا بعد التجربة ولا يُقدّر مسبقًا.',
    gov_level: 'متوسط',
    gov_notes: 'رفع كفاءة التشغيل، وبيانات أوضح لدعم القرار والرقابة، وتقليل الهدر حيث تتكرر الإجراءات.',
  };
  return D[key] ?? '';
}
export const val = (idea, key) => { const ws = getWS(idea.id); return ws[key] ?? draftFor(idea, key); };

// ---------- prototype suggestion ----------
export const PROTO_TYPES = [
  { id: 'booking', t: 'نظام حجز', icon: 'calendar', d: 'اختيار الخدمة والجهة والموعد ثم تأكيد ومتابعة.' },
  { id: 'tracking', t: 'نظام متابعة', icon: 'gauge', d: 'خريطة وقائمة ومراحل ونسب إنجاز وفلاتر.' },
  { id: 'reporting', t: 'نظام بلاغات', icon: 'warning', d: 'تقديم بلاغ بالمكان والنوع ومتابعة حالته.' },
  { id: 'dashboard', t: 'لوحة مؤشرات', icon: 'bars', d: 'مؤشرات ورسوم للمسؤول من بيانات تجريبية.' },
  { id: 'map', t: 'خريطة تفاعلية', icon: 'map', d: 'استخدام خريطة المشروعات الحالية بفلتر القطاع.' },
  { id: 'portal', t: 'بوابة خدمات', icon: 'grid', d: 'استخدام بوابة الخدمات الحالية للقطاع.' },
  { id: 'website', t: 'موقع تعريفي', icon: 'browser', d: 'صفحة تعرض المشروع للجمهور.' },
  { id: 'mobile', t: 'تطبيق موبايل', icon: 'mobile', d: 'نسخة موبايل من نظام البلاغات.' },
];
export function suggestProto(idea) {
  const tx = idea.t + ' ' + idea.h;
  if (/حجز|موعد|مواعيد/.test(tx)) return 'booking';
  if (/متابعة|تتبع|رقم متابعة|أعمال الطرق/.test(tx)) return 'tracking';
  if (/بلاغ|شكوى|بلاغات/.test(tx)) return 'reporting';
  if (/لوحة|مؤشرات/.test(tx)) return 'dashboard';
  if (/خريطة/.test(tx)) return 'map';
  if (/دليل|مسار إرشادي/.test(tx)) return 'portal';
  return 'website';
}

// ---------- Idea Lab: generation templates ----------
const PATTERNS = [
  { re: /زحام|طابور|انتظار|دور/, t: 'حجز موعد مسبق في قطاع', fill: false, h: 'حجز موعد رقمي مع تذكير بالمستندات وتوزيع الإقبال على اليوم.' },
  { re: /مش عارف|معلومه|يعرف|فين|حيره|متفرق/, t: 'دليل موحد لقطاع', fill: true, h: 'دليل رقمي واضح بالخطوات والجهة والمصدر وتاريخ التحديث.' },
  { re: /عطل|كسر|بلاغ|مشكله|قمامه|زباله|حفره|اناره/, t: 'بلاغات بالموقع والصورة في قطاع', fill: true, h: 'بلاغ بصورة وموقع يُوجَّه للجهة المختصة مع رقم متابعة.' },
  { re: /تاخير|متابعه|مش عارفين وصلت|حاله/, t: 'متابعة الحالة والتنفيذ في قطاع', fill: true, h: 'متابعة مراحل التنفيذ والحالة مع تنبيهات عند التغيير.' },
  { re: /بيانات|ارقام|قرار|تقارير/, t: 'لوحة مؤشرات لقطاع', fill: true, h: 'لوحة مؤشرات تجمع بيانات الجهات وتدعم القرار.' },
];
const SECTOR_WORDS = {
  roads: 'طريق طرق كوبري مرور تحويله رصف مواصلات', health: 'مستشفي وحده صحيه عياده علاج دكتور دوا', education: 'مدرسه تعليم طلاب فصول تحويل',
  environment: 'تلوث حرق قش بيئه دخان', cleanliness: 'زباله قمامه نظافه مخلفات صناديق', tourism: 'سياحه اثار مصيف زوار فعاليات',
  invest: 'استثمار مصنع منطقه صناعيه مستثمر ارض', urban: 'بناء عمران تخطيط مخالفات اسكان', infra: 'مياه صرف كهرباء شبكه انقطاع',
  tech: 'تطبيق موقع رقمي انترنت نظام', pm: 'مشروعات تنفيذ متابعه تاخير مقاول', services: 'خدمه ترخيص شهاده بطاقه اوراق مستندات',
};
export function detectSector(text) {
  const nq = normalize(text); let best = 'services', n = 0;
  for (const [id, w] of Object.entries(SECTOR_WORDS)) { const c = w.split(' ').filter((x) => nq.includes(x)).length; if (c > n) { n = c; best = id; } }
  return best;
}
export function problemToIdeas(problem, sectorId) {
  const sec = sectorId || detectSector(problem); const st = sectorById[sec]?.title || 'الخدمات';
  const nq = normalize(problem);
  const hits = PATTERNS.filter((p) => p.re.test(nq));
  const use = [...hits, ...PATTERNS.filter((p) => !hits.includes(p) && p.fill)].slice(0, 3);
  return { sector: sec, ideas: use.map((p, k) => ({ t: `${p.t} ${st}`, p: problem, h: p.h, n: 'بيانات وتعاون من الجهة المختصة', hz: k === 0 ? 'quick' : 'mid', sector: sec })) };
}

const OPP = {
  services: { unmet: ['تكرار الزيارة لنفس الخدمة بسبب نقص مستند', 'غياب مصدر موحد للرسوم والمستندات المعتمدة'], gaps: ['الخدمات المحلية غير مرتبطة بالمنصات القومية'], digital: ['حجز موعد ومتابعة طلب', 'نماذج رقمية قبل الزيارة'], cx: ['رسائل تذكير بالمستندات قبل الموعد'] },
  roads: { unmet: ['مفاجأة المواطن بإغلاق الطرق', 'بلاغات الحفر لا تُتابع'], gaps: ['أعمال الطرق والتحويلات وبلاغات الشارع منفصلة'], digital: ['خريطة أعمال وتحويلات حية', 'متابعة نسب الإنجاز'], cx: ['تنبيه مسبق للسكان قبل بدء الأعمال'] },
  health: { unmet: ['الطوابير الصباحية في العيادات', 'صعوبة معرفة التخصصات المتاحة'], gaps: ['مواعيد العيادات غير منشورة رقميًا'], digital: ['حجز دور مسبق', 'دليل الوحدات بالتخصصات'], cx: ['رسالة بالموعد التقريبي للكشف'] },
  education: { unmet: ['الحيرة في التحويلات ومواعيدها'], gaps: ['معلومات الكثافات والمشروعات غير متاحة للأسر'], digital: ['مسار إرشادي رقمي للتقديم', 'خريطة المدارس'], cx: ['إجابات فورية لأسئلة أولياء الأمور'] },
  environment: { unmet: ['حرق قش الأرز موسميًا', 'غياب قياس معلن للتلوث المحلي'], gaps: ['التجميع غير مرتبط بالمستفيدين'], digital: ['تسجيل كميات القش ونقاط التجميع'], cx: ['حملات توعية مرتبطة بالمواسم'] },
  cleanliness: { unmet: ['تراكم المخلفات في نقاط بعينها', 'البلاغات لا تصل للوحدة المحلية الصحيحة'], gaps: ['جداول الجمع غير معلنة'], digital: ['بلاغ بالصورة والموقع', 'جدول جمع معلن لكل منطقة'], cx: ['إشعار السكان بموعد الجمع'] },
  tourism: { unmet: ['معالم المحافظة غير معروفة للزائر'], gaps: ['الفعاليات تُعلن متفرقة'], digital: ['مسارات سياحية رقمية', 'تقويم فعاليات'], cx: ['محتوى موثق لكل معلم بمصدره'] },
  invest: { unmet: ['المستثمر لا يرى الأراضي المتاحة بسهولة'], gaps: ['غياب ملف تعريفي اقتصادي لكل مركز'], digital: ['عرض الطروحات الرسمية الخاصة بالمحافظة'], cx: ['مسار إرشادي واحد للمستثمر'] },
  urban: { unmet: ['الحيرة في تراخيص البناء والتصالح'], gaps: ['المخططات غير معروضة للمواطن'], digital: ['مسار إرشادي للتراخيص', 'خريطة للمخططات المعتمدة'], cx: ['قائمة مستندات معتمدة قبل التقديم'] },
  infra: { unmet: ['الانقطاعات المفاجئة', 'مشروعات القرى غير معروفة لسكانها'], gaps: ['بلاغات الأعطال متفرقة بين القنوات'], digital: ['إعلان مسبق للصيانة حسب المنطقة', 'متابعة مشروعات الصرف'], cx: ['رقم متابعة للبلاغ'] },
  tech: { unmet: ['أنظمة الجهات لا تتبادل البيانات'], gaps: ['غياب هوية رقمية موحدة للمحافظة'], digital: ['منصة بيانات مفتوحة', 'مساعد ذكي متصل بمصادر رسمية'], cx: ['تجربة موحدة بين خدمات الجهات'] },
  pm: { unmet: ['تأخر المشروعات دون إنذار مبكر'], gaps: ['تقارير المتابعة ورقية وموزعة'], digital: ['لوحة متابعة المشروعات', 'جداول زمنية مرئية'], cx: ['إتاحة حالة المشروع للمواطنين'] },
};
export function discoverOpportunities(sectorId) {
  const o = OPP[sectorId] || OPP.services;
  const catalog = allIdeas().filter((i) => i.sector === sectorId);
  return { ...o, quick: catalog.filter((i) => i.hz === 'quick'), strategic: catalog.filter((i) => i.hz === 'long') };
}
export function generateIdeas(sectorId) {
  const o = OPP[sectorId] || OPP.services; const st = sectorById[sectorId]?.title;
  return [
    ...o.digital.map((d, k) => ({ t: d, p: o.unmet[k] || o.unmet[0], h: `${d} ضمن قطاع ${st}، بخطوات واضحة للمواطن وبيانات من الجهة.`, n: 'بيانات وتعاون من الجهة المختصة', hz: k ? 'mid' : 'quick', sector: sectorId })),
    ...o.cx.map((d) => ({ t: d, p: o.gaps[0], h: `${d} لتحسين تجربة المواطن في قطاع ${st}.`, n: 'قناة رسائل معتمدة', hz: 'quick', sector: sectorId })),
    { t: `منظومة ${st} المتكاملة`, p: o.gaps[0], h: `ربط ${o.digital.join(' و')} في منظومة واحدة بلوحة متابعة.`, n: 'ربط رسمي وصلاحيات', hz: 'long', sector: sectorId },
  ];
}
export const IMPROVEMENTS = [
  { k: 'components', t: 'قناة موبايل', v: 'نسخة موبايل للمواطن مع تنبيهات' },
  { k: 'kpis', t: 'مؤشر رضا المستخدم', v: 'رضا المستخدم بعد كل استخدام (تقييم من 5)' },
  { k: 'phases', t: 'تجربة في مركز واحد', v: 'تجربة محدودة في مركز واحد قبل التعميم' },
  { k: 'components', t: 'ربط بالمساعد الذكي', v: 'إجابات المساعد عن الخدمة مع المصدر' },
  { k: 'stakeholders', t: 'إشراك الوحدات المحلية', v: 'الوحدات المحلية للمراكز والمدن' },
  { k: 'risks', t: 'خطة تحديث المحتوى', v: 'تكليف مسؤول تحديث بمراجعة دورية لتفادي تقادم البيانات' },
];

// ---------- project intelligence ----------
const projSec = Object.fromEntries(projSectors.map((s) => [s.id, s.title]));
const placeName = Object.fromEntries(places.map((p) => [p.id, p.name]));
export function relatedProjects(p) {
  return projects.filter((x) => x.id !== p.id).map((x) => {
    const why = []; let s = 0;
    if (x.sector === p.sector) { s += 2; why.push(`نفس القطاع (${projSec[x.sector]})`); }
    if (x.place === p.place) { s += 2; why.push(`نفس المركز (${placeName[x.place]})`); }
    if (x.agency === p.agency) { s += 1; why.push('نفس الجهة'); }
    if (x.hayaKarima && p.hayaKarima) { s += 1; why.push('ضمن حياة كريمة'); }
    return { x, s, why: why.join(' · ') };
  }).filter((r) => r.s >= 2).sort((a, b) => b.s - a.s).slice(0, 5);
}
export function relatedIdeasForProject(p) {
  const linked = ideasLinkedTo(p.id);
  const bySector = allIdeas().filter((i) => (PROJ_TO_IDEA_SECTOR[p.sector] || []).includes(i.sector) && !linked.includes(i));
  return { linked, suggested: bySector.slice(0, 4) };
}
const PROJ_OPP = {
  roads: ['إعلان مسبق للأعمال والتحويلات للسكان', 'متابعة مراحل التنفيذ ونسب الإنجاز بشكل معلن', 'ربط بلاغات الحفر والإنارة بالمشروع'],
  water: ['إعلان مواعيد الأعمال وانقطاع المياه المرتبط بها', 'متابعة توصيل المنازل بعد التشغيل', 'قناة بلاغات خاصة بالمشروع'],
  electricity: ['إعلان مسبق للفصل المرتبط بالأعمال', 'متابعة الأعطال بعد التشغيل', 'بيانات استهلاك مجمعة لدعم التخطيط'],
  health: ['حجز موعد مسبق بعد التشغيل', 'نشر التخصصات وأيام العيادات', 'قياس رضا المترددين'],
  education: ['نشر الطاقة الاستيعابية بعد الافتتاح', 'مسار تقديم رقمي للأسر', 'متابعة الصيانة الدورية'],
  youth: ['حجز الملاعب والقاعات رقميًا', 'تقويم أنشطة المركز', 'قياس الإقبال لدعم التوسع'],
};
const OPP_TYPES = ['فرصة تحول رقمي', 'فرصة تحسين تجربة المواطن', 'فرصة رفع الكفاءة'];
export const projectOpportunities = (p) => (PROJ_OPP[p.sector] || []).map((t, k) => ({ t, type: OPP_TYPES[k % 3] }));
export function opportunityToIdea(p, opp) {
  const ideaSector = (PROJ_TO_IDEA_SECTOR[p.sector] || ['gov'])[0];
  const rec = addIdea({ t: opp.t, sector: ideaSector, hz: 'quick', p: `فرصة تطوير مرتبطة بمشروع «${p.name}».`, h: opp.t, n: 'بيانات المشروع من الجهة المسؤولة', fromProject: p.id });
  linkProject(rec.id, p.id); return rec;
}
export { HORIZON };
