// Local Arabic smart search: normalisation + light stemming + dialect synonyms + weighted scoring.
// Runs fully in the browser; no data leaves the page.
import { services } from '../data/services.js?v=202611261630';
import { categories, agencies } from '../data/catalog.js?v=202611261630';
import { places } from '../data/places.js?v=202611261630';

export function normalize(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ').trim();
}

const STOP = new Set(normalize(`عايز عاوز عايزه عاوزه محتاج محتاجه ابغي اريد ازاي كيف ممكن لو سمحت فضلك انا احنا عن في من الي الى على علي عشان علشان
  اعمل اطلع استخرج اخد اخذ هو هي ده دي دا ايه اي اعرف يا او ما اللي بتاع بتاعتي عندي لي ليا مع بعد قبل كده كدا ازاى اقدم طلب خدمه حاجه
  the a an i want how to`).split(' '));

const SYN = {
  رخصه: ['ترخيص'], ترخيص: ['رخصه'], عربيه: ['سياره', 'مركبه'], عربيتي: ['سياره'], سياره: ['عربيه'],
  نور: ['كهرباء'], كهربا: ['كهرباء'], ميه: ['مياه'], شغل: ['عمل', 'وظيفه'], دكان: ['محل'], جواز: ['زواج'],
  بطاقتي: ['بطاقه'], البطاقه: ['بطاقه'], فلوس: ['دعم'], زباله: ['شكوى'], قمامه: ['شكوى'], مجاري: ['صرف'],
};

export function stem(t) {
  let w = t;
  for (const p of ['وال', 'بال', 'فال', 'كال', 'لل', 'ال']) {
    if (w.startsWith(p) && w.length - p.length >= 2) { w = w.slice(p.length); break; }
  }
  if (w.length > 4 && /(ات|ين|ون)$/.test(w)) w = w.slice(0, -2);
  return w;
}

export function tokens(q) {
  const out = [];
  for (const raw of normalize(q).split(' ')) {
    if (!raw || STOP.has(raw)) continue;
    const s = stem(raw);
    if (STOP.has(s)) continue;
    out.push(s);
    if (s.length >= 4 && 'لبوف'.includes(s[0])) out.push(s.slice(1)); // لمحل → محل
    for (const syn of SYN[raw] || SYN[s] || []) out.push(stem(normalize(syn)));
  }
  return [...new Set(out)];
}

// Build index once.
const catById = Object.fromEntries(categories.map((c) => [c.id, c]));
const agById = Object.fromEntries(agencies.map((a) => [a.id, a]));
const toks = (s) => normalize(s).split(' ').filter((t) => t && !STOP.has(t)).map(stem);

const index = services.map((s) => ({
  s,
  phrases: s.keywords.map(normalize).filter((k) => k.includes(' ')),
  kw: new Set(s.keywords.flatMap(toks)),
  title: new Set(toks(s.title)),
  body: new Set([...toks(s.summary), ...toks(catById[s.cat].title), ...toks(agById[s.agency]?.name || '')]),
}));

const near = (a, b) => a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a));

export function searchServices(q, { cat = null, agency = null, channel = null } = {}) {
  const nq = normalize(q);
  const qt = tokens(q);
  const results = [];
  for (const it of index) {
    const s = it.s;
    if (cat && s.cat !== cat) continue;
    if (agency && s.agency !== agency) continue;
    if (channel && !s.channels.some((c) => c.kind === channel)) continue;
    if (!qt.length) { results.push({ s, score: 0, hits: [] }); continue; }
    let score = 0; const hits = new Set();
    for (const p of it.phrases) if (nq.includes(p)) { score += 6; hits.add(p); }
    for (const t of qt) {
      if (it.kw.has(t)) { score += 3; hits.add(t); }
      else if (it.title.has(t)) { score += 3; hits.add(t); }
      else if ([...it.kw, ...it.title].some((k) => near(k, t))) { score += 1.5; hits.add(t); }
      else if (it.body.has(t)) { score += 1; hits.add(t); }
    }
    if (score > 0) results.push({ s, score, hits: [...hits] });
  }
  return results.sort((a, b) => b.score - a.score || (b.s.popular ? 1 : 0) - (a.s.popular ? 1 : 0));
}

export function searchAgencies(q) {
  const qt = tokens(q); if (!qt.length) return [];
  return agencies
    .map((a) => {
      const hit = (arr) => arr.filter((t) => qt.some((x) => x === t || near(x, t))).length;
      return { a, score: hit(toks(a.name + ' ' + a.type)) * 2 + hit(toks(a.about)) };
    })
    .filter((r) => r.score > 0).sort((x, y) => y.score - x.score)
    .filter((r, _, arr) => r.score === arr[0].score).map((r) => r.a);
}

export function findPlaces(q) {
  const nq = ' ' + normalize(q) + ' ';
  return places.filter((p) => {
    const n = normalize(p.name);
    return nq.includes(' ' + n + ' ') || nq.includes(' ب' + n + ' ') || nq.includes(' في ' + n) || (n.startsWith('ال') && nq.includes(' ' + n.slice(2) + ' '));
  });
}

export function searchAll(q) {
  return { services: searchServices(q), agencies: searchAgencies(q), places: findPlaces(q) };
}
