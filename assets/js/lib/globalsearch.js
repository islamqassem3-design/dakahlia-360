// Unified search across the three products (Phase 04).
// Services use the dedicated weighted engine; other entities use a light token scorer.
import { tokens, searchServices, findPlaces } from './search.js?v=202611261625';
import { agencies } from '../data/catalog.js?v=202611261625';
import { places, PLACE_KIND } from '../data/places.js?v=202611261625';
import { projects, sectors } from '../data/projects.js?v=202611261625';
import { pois, poiCats, economy } from '../data/discover.js?v=202611261625';

const toks = (s) => tokens(s);
const near = (a, b) => a.length >= 3 && b.length >= 3 && (a.startsWith(b) || b.startsWith(a));
const secTitle = Object.fromEntries(sectors.map((s) => [s.id, s.title]));
const catTitle = Object.fromEntries(poiCats.map((c) => [c.id, c.title]));
const placeName = Object.fromEntries(places.map((p) => [p.id, p.name]));

function score(qt, title, body = '') {
  const tt = toks(title), bt = toks(body); let s = 0;
  for (const q of qt) {
    if (tt.includes(q)) s += 3; else if (tt.some((t) => near(t, q))) s += 1.5;
    else if (bt.includes(q)) s += 1; else if (bt.some((t) => near(t, q))) s += 0.5;
  }
  return s;
}
const rank = (arr, fn, min = 1) => arr.map((x) => ({ x, s: fn(x) })).filter((r) => r.s >= min).sort((a, b) => b.s - a.s).map((r) => r.x);

export function globalSearch(q) {
  const qt = tokens(q);
  if (!qt.length) return { total: 0, groups: [] };
  const plc = findPlaces(q);
  const inPlace = (id) => plc.some((p) => p.id === id);
  const groups = [
    { id: 'services', title: 'خدمات', items: searchServices(q).filter((r) => r.score >= 3).slice(0, 6).map((r) => ({ href: `#/service/${r.s.id}`, title: r.s.title, meta: r.s.summary, icon: 'grid' })) },
    { id: 'places', title: 'مراكز ومدن', items: (plc.length ? plc : rank(places, (p) => score(qt, p.name), 3)).slice(0, 4).map((p) => ({ href: `#/place/${p.id}`, title: p.name, meta: PLACE_KIND[p.kind], icon: 'pin' })) },
    { id: 'pois', title: 'معالم', items: rank(pois, (p) => score(qt, `${p.name} ${catTitle[p.cat]}`, p.short) + (inPlace(p.place) ? 2 : 0), 1.5).slice(0, 4).map((p) => ({ href: `#/poi/${p.id}`, title: p.name, meta: `${placeName[p.place]} · ${catTitle[p.cat]}`, icon: 'compass' })) },
    { id: 'projects', title: 'مشروعات (تجريبية)', items: rank(projects, (p) => score(qt, p.name, `${secTitle[p.sector]} ${placeName[p.place]}`) + (inPlace(p.place) ? 2 : 0), 2.5).slice(0, 4).map((p) => ({ href: `#/project/${p.id}`, title: p.name, meta: `${placeName[p.place]} · ${secTitle[p.sector]}`, icon: 'map', demo: true })) },
    { id: 'agencies', title: 'جهات', items: rank(agencies, (a) => score(qt, a.name, `${a.type} ${a.about}`), 2).slice(0, 4).map((a) => ({ href: `#/agency/${a.id}`, title: a.name, meta: a.type, icon: 'building' })) },
    { id: 'economy', title: 'استثمار ومقومات', items: rank(economy, (e) => score(qt, e.title, e.text), 2).slice(0, 3).map((e) => ({ href: '#/invest', title: e.title, meta: e.text, icon: 'chart' })) },
  ].filter((g) => g.items.length);
  return { total: groups.reduce((n, g) => n + g.items.length, 0), groups };
}
