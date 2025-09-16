import type { Card } from '../types/card'

export type Query = {
  q?: string;
  set?: string[];
  archetype?: string[];
  category?: ('Monster'|'Spell'|'Trap') | '';
  icon?: string[];
  cardTypes?: string[];
  monsterType?: string[];
  attribute?: string[];
  levelMin?: number; levelMax?: number;
  rankMin?: number; rankMax?: number;
  linkMin?: number; linkMax?: number;
  scaleMin?: number; scaleMax?: number;
  atkMin?: number; atkMax?: number;
  defMin?: number; defMax?: number;
  legal?: string[]; // 'semi' | 'limited' | 'banned' | 'legal'
  sort?: string; // name|atk|def|level|rank|link|date
  view?: 'grid'|'list';
  linkArrows?: string[]; // ['T','TR','R','BR','B','BL','L','TL']
}

export function cardMatches(c: Card, q: Query) {
  // categorical
  if (q.set?.length && !q.set.some(s => (c.set ?? '').includes(s))) return false;
  if (q.archetype?.length && !q.archetype.includes(c.archetype || '')) return false;
  if (q.category && c.category !== q.category) return false;
  if (q.icon?.length && !q.icon.includes(c.icon || '')) return false;
  if (q.cardTypes?.length && !q.cardTypes.every(t => (c.cardTypes || []).includes(t))) return false;
  if (q.monsterType?.length && !q.monsterType.some(t => (c.monsterType || []).includes(t))) return false;
  if (q.attribute?.length && !q.attribute.includes(c.attribute || '')) return false;

  // link arrows (AND)
  if (q.linkArrows?.length) {
    const have = c.linkArrows || []
    const allIncluded = q.linkArrows.every(a => have.includes(a))
    if (!allIncluded) return false
  }

  // numeric helpers
  const inRange = (val: number|undefined|null, min?: number, max?: number) => {
    if (val == null) return false;
    if (min != null && val < min) return false;
    if (max != null && val > max) return false;
    return true;
  }

  if (q.levelMin != null || q.levelMax != null) {
    if (!inRange(c.level ?? undefined, q.levelMin, q.levelMax)) return false;
  }
  if (q.rankMin != null || q.rankMax != null) {
    if (!inRange(c.rank ?? undefined, q.rankMin, q.rankMax)) return false;
  }
  if (q.linkMin != null || q.linkMax != null) {
    if (!inRange(c.linkRating ?? undefined, q.linkMin, q.linkMax)) return false;
  }
  if (q.scaleMin != null || q.scaleMax != null) {
    if (!inRange(c.scale ?? undefined, q.scaleMin, q.scaleMax)) return false;
  }
  if (q.atkMin != null || q.atkMax != null) {
    if (!inRange(c.atk ?? undefined, q.atkMin, q.atkMax)) return false;
  }
  if (q.defMin != null || q.defMax != null) {
    if (!inRange(c.def ?? undefined, q.defMin, q.defMax)) return false;
  }

  // legal mapping
  if (q.legal?.length) {
    const status = c.legal?.banned
      ? 'banned'
      : c.legal?.limited
        ? 'limited'
        : c.legal?.semiLimited
          ? 'semi'
          : 'legal';
    if (!q.legal.includes(status)) return false;
  }
  return true;
}

export function sortCards(list: Card[], key?: string, dir: 'asc'|'desc' = 'asc') {
  const by = (fn: (c: Card)=>any) => {
    const cmp = (a: any, b: any) => {
      const av = fn(a), bv = fn(b);
      // nulls/undefined at the end regardless of direction
      const aNull = av == null, bNull = bv == null
      if (aNull && bNull) return 0
      if (aNull) return 1
      if (bNull) return -1
      if (av < bv) return -1
      if (av > bv) return 1
      return 0
    }
    return [...list].sort((a,b)=> dir === 'asc' ? cmp(a,b) : -cmp(a,b))
  }
  switch(key){
    case 'atk':   return by(c=>c.atk ?? null)
    case 'def':   return by(c=>c.def ?? null)
    case 'level': return by(c=>c.level ?? null)
    case 'rank':  return by(c=>c.rank ?? null)
    case 'link':  return by(c=>c.linkRating ?? null)
    case 'date':  return by(c=>c.timestamps?.added ?? null) // 'YYYY-MM-DD' sorts lexicographically
    case 'name':
    default:      return by(c=> (c.name || '').toLowerCase())
  }
}
