// Data status vocabulary used everywhere in the UI.
// verified    : the official link responded when checked (checkedAt), content still needs agency review.
// unverified  : information not confirmed yet → UI shows «غير متحقق منها حالياً».
// demo        : sample data shown only to demonstrate the UI → always badged «بيانات تجريبية».
export const CHECKED_AT = '2026-11-26';

export const STATUS = {
  verified: { label: 'رابط رسمي تم فحصه', tone: 'ok' },
  unreachable: { label: 'تعذّر فحص الرابط آليًا', tone: 'warn' },
  unverified: { label: 'غير متحقق منها حالياً', tone: 'warn' },
  demo: { label: 'بيانات تجريبية', tone: 'demo' },
};

// Official sources referenced by agencies/services. status = result of a link check on CHECKED_AT.
export const sources = {
  dakahlia: { name: 'الموقع الرسمي لمحافظة الدقهلية', url: 'https://www.dakahlia.gov.eg', status: 'unreachable' },
  digital: { name: 'بوابة مصر الرقمية', url: 'https://digital.gov.eg', status: 'verified' },
  ppo: { name: 'بوابة مرور مصر', url: 'https://ppo.gov.eg', status: 'verified' },
  moi: { name: 'وزارة الداخلية', url: 'https://moi.gov.eg', status: 'verified' },
  nosi: { name: 'الهيئة القومية للتأمين الاجتماعي', url: 'https://www.nosi.gov.eg', status: 'verified' },
  moss: { name: 'وزارة التضامن الاجتماعي', url: 'https://www.moss.gov.eg', status: 'verified' },
  manpower: { name: 'وزارة العمل', url: 'https://www.manpower.gov.eg', status: 'verified' },
  nuca: { name: 'هيئة المجتمعات العمرانية الجديدة', url: 'http://www.newcities.gov.eg', status: 'verified' },
  shakwa: { name: 'منظومة الشكاوى الحكومية الموحدة', url: 'https://www.shakwa.eg', status: 'verified' },
  gafi: { name: 'الهيئة العامة للاستثمار والمناطق الحرة', url: 'https://www.gafi.gov.eg', status: 'verified' },
  investinegypt: { name: 'منصة Invest in Egypt', url: 'https://www.investinegypt.gov.eg', status: 'verified' },
  eta: { name: 'مصلحة الضرائب المصرية', url: 'https://www.eta.gov.eg', status: 'verified' },
  hcww: { name: 'الشركة القابضة لمياه الشرب والصرف الصحي', url: 'https://www.hcww.com.eg', status: 'verified' },
  eehc: { name: 'الشركة القابضة لكهرباء مصر', url: 'https://www.eehc.gov.eg', status: 'verified' },
  moe: { name: 'وزارة التربية والتعليم', url: 'https://moe.gov.eg', status: 'verified' },
  mohp: { name: 'وزارة الصحة والسكان', url: 'https://www.mohp.gov.eg', status: 'unreachable' },
  emys: { name: 'وزارة الشباب والرياضة', url: 'https://www.emys.gov.eg', status: 'verified' },
  hayakarima: { name: 'المبادرة الرئاسية حياة كريمة', url: 'https://hayakarima.com', status: 'verified' },
  capmas: { name: 'الجهاز المركزي للتعبئة العامة والإحصاء', url: 'https://www.capmas.gov.eg', status: 'verified' },
};
