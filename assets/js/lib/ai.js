// Real AI (optional): Google Gemini free tier, called directly from the browser.
// The user pastes their own free key from Google AI Studio; it is stored ONLY in this browser (localStorage)
// and never committed or sent anywhere except Google's API. Without a key, the app keeps the rule-based simulation.
const KEY = 'd360.ai.key', MODEL = 'd360.ai.model';
const API = 'https://generativelanguage.googleapis.com/v1beta';
const PREFERRED = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];

export const aiKey = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
export const aiModel = () => { try { return localStorage.getItem(MODEL) || PREFERRED[0]; } catch { return PREFERRED[0]; } };
export const aiOn = () => !!aiKey();
export function aiClear() { localStorage.removeItem(KEY); localStorage.removeItem(MODEL); dispatchEvent(new Event('d360:ai')); }

// Validate the key and pick an available free "flash" model.
export async function aiConnect(key) {
  const r = await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error?.message?.includes('API key') ? 'المفتاح غير صحيح. انسخه مرة أخرى من Google AI Studio.' : `تعذّر الاتصال (${r.status}).`);
  const names = (j.models || []).filter((m) => (m.supportedGenerationMethods || []).includes('generateContent')).map((m) => m.name.replace('models/', ''));
  const pick = PREFERRED.find((p) => names.includes(p)) || names.find((n) => /flash/.test(n) && !/lite|image|tts|live|preview|exp/.test(n)) || names.find((n) => /flash/.test(n));
  if (!pick) throw new Error('لم نجد نموذج Gemini مناسبًا متاحًا لهذا المفتاح.');
  localStorage.setItem(KEY, key); localStorage.setItem(MODEL, pick);
  dispatchEvent(new Event('d360:ai'));
  return pick;
}

const SYSTEM = `أنت مستشار تطوير مشروعات حكومية رقمية لمحافظة الدقهلية في مصر، تعمل داخل منصة Dakahlia 360°.
قواعد ملزمة:
- اكتب بالعربية الفصحى المبسطة، بجمل قصيرة وواضحة، دون شرطات.
- لا تخترع أرقامًا أو نسبًا أو إحصاءات أو ميزانيات أو مددًا أو رسومًا أو أسماء مشروعات أو جهات غير موجودة. إن احتجت رقمًا اكتب: "يُحدد بعد القياس مع الجهة".
- الجهات التي يمكن ذكرها: ديوان عام المحافظة، الوحدات المحلية للمراكز والمدن، المديريات (الصحة، التعليم، التضامن، التموين، العمل، الشباب والرياضة، الزراعة)، شركة مياه الشرب والصرف الصحي بالدقهلية، شركة شمال الدلتا لتوزيع الكهرباء، منظومة الشكاوى الحكومية، بوابة مصر الرقمية، الهيئة العامة للاستثمار، الهيئة العامة للتنمية الصناعية، هيئة المجتمعات العمرانية الجديدة.
- قدّم مقترحات عملية قابلة للتنفيذ كنموذج تجريبي أولًا.
- أعد JSON صالحًا فقط بالمفاتيح المطلوبة، بدون أي نص خارجه.`;

export async function aiJSON(task, shapeHint) {
  const key = aiKey(); if (!key) throw new Error('الذكاء الاصطناعي غير مفعّل.');
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM }] },
    contents: [{ role: 'user', parts: [{ text: `${task}\n\nشكل JSON المطلوب:\n${shapeHint}` }] }],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.6 },
  };
  const r = await fetch(`${API}/models/${aiModel()}:generateContent`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (r.status === 429) throw new Error('تم تجاوز الحد المجاني المؤقت. انتظر دقيقة وحاول مرة أخرى.');
  if (!r.ok) throw new Error(j.error?.message ? `خطأ من Gemini: ${j.error.message}` : `تعذّر الاتصال (${r.status}).`);
  const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
  try { return JSON.parse(text.replace(/^```json\s*|```$/g, '')); } catch { throw new Error('رد غير مفهوم من النموذج. حاول مرة أخرى.'); }
}

// ---------- tasks ----------
const ideaCtx = (idea, sectorTitle) => `الفكرة: ${idea.t}\nالقطاع: ${sectorTitle}\nالمشكلة: ${idea.p}\nالفكرة المقترحة: ${idea.h}\nتحتاج: ${idea.n}`;

export function aiSection(idea, sectorTitle, fields, current) {
  const shape = `{ ${fields.map(([k, l, t]) => `"${k}": ${t === 'list' ? '["بند", "بند"]' : t === 'level' ? '"منخفض" | "متوسط" | "مرتفع"' : '"نص"'} /* ${l} */`).join(', ')} }`;
  const cur = fields.map(([k, l]) => `${l}: ${current[k] || ''}`).join('\n');
  return aiJSON(`${ideaCtx(idea, sectorTitle)}\n\nالمحتوى الحالي للقسم (طوّره وحسّنه ولا تكرره حرفيًا):\n${cur}\n\nاكتب محتوى أقوى وأكثر تحديدًا لهذا القسم. القوائم من 3 إلى 6 بنود.`, shape);
}
export function aiScore(idea, sectorTitle, criteria) {
  return aiJSON(`${ideaCtx(idea, sectorTitle)}\n\nقيّم الفكرة تقديريًا من 1 إلى 5 لكل معيار: ${criteria.map((c) => `${c.id} = ${c.t}`).join('، ')}. اذكر سببًا قصيرًا لكل درجة.`,
    `{ "scores": { ${criteria.map((c) => `"${c.id}": 1-5`).join(', ')} }, "reasons": { ${criteria.map((c) => `"${c.id}": "سبب"`).join(', ')} }, "summary": "خلاصة التقييم في جملتين" }`);
}
const IDEAS_SHAPE = '{ "ideas": [ { "t": "عنوان قصير", "p": "المشكلة", "h": "كيف تعمل الفكرة", "n": "ما تحتاجه لتبدأ", "hz": "quick" | "mid" | "long" } ] }';
export const aiGenerate = (sectorTitle) => aiJSON(`ولّد 4 أفكار تطوير مبتكرة وعملية لقطاع ${sectorTitle} في محافظة الدقهلية، متنوعة بين سريعة ومتوسطة واستراتيجية.`, IDEAS_SHAPE);
export const aiProblem = (problem, sectorIds) => aiJSON(`مشكلة كتبها مواطن بالعامية: "${problem}"\nحلّل المشكلة واقترح 3 أفكار حلول. اختر القطاع الأنسب من هذه المعرفات فقط: ${sectorIds.join(', ')}.`,
  `{ "sector": "معرف القطاع", "analysis": { "core": "جوهر المشكلة", "affected": "المتضررون", "causes": "أسباب محتملة" }, ${IDEAS_SHAPE.slice(1)}`);
export const aiOpps = (sectorTitle) => aiJSON(`حلّل قطاع ${sectorTitle} في محافظة الدقهلية واكتشف فرص التطوير. 2 إلى 3 بنود لكل قائمة.`,
  '{ "unmet": ["مشكلة غير معالجة"], "gaps": ["خدمة غير متكاملة"], "digital": ["فرصة تحول رقمي"], "cx": ["تحسين تجربة المواطن"], "quick": ["Quick Win"], "strategic": ["فرصة مشروع استراتيجي"] }');
export const aiMerge = (ideas) => aiJSON(`ادمج هذه الأفكار في مشروع واحد أقوى:\n${ideas.map((i, n) => `${n + 1}. ${i.t}: ${i.h}`).join('\n')}`,
  '{ "name": "اسم المشروع الموحد", "relation": "العلاقة بين الأفكار", "parts": ["مكون"], "problem": "المشكلة التي يعالجها", "value": "القيمة الناتجة عن الدمج", "vision": "تصور المشروع بعد الدمج" }');
