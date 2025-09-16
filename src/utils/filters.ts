// src/utils/filters.ts
import type { Card, BanStatus } from '../types/card'
import { getBanStatus } from '../types/card'

export type Query = {
  q?: string;                        // handled by fuse in search.ts
  set?: string[];                    // match card.set (string) if provided
  archetype?: string[];              // match card.archetype
  category?: ('Monster'|'Spell'|'Trap') | ''; // match card.category
  icon?: string[];                   // match card.icon (Spell/Trap icon)
  cardTypes?: string[];              // every requested must be in card.cardTypes
  monsterType?: string[];            // every requested must be in card.monsterType
  attribute?: string[];              // match card.attribute
  levelMin?: number; levelMax?: number;
  rankMin?: number;  rankMax?: number;
  linkMin?: number;  linkMax?: number;
  scaleMin?: number; scaleMax?: number;
  atkMin?: number;   atkMax?: number;
  defMin?: number;   defMax?: number;
  legal?: string[];                  // e.g. ["banned","limited","semiLimited"] or ["Forbidden", ...]
  linkArrows?: string[];             // from URL → strings; we'll coerce to numbers
  sort?: string;                     // handled in sortCards
  view?: 'grid' | 'list';            // UI hint only
}

// ---- helpers ---------------------------------------------------------------

const inArray = (val: string | null | undefined, arr?: string[]) =>
  !!val && !!arr?.length && arr.some(a => a.toLowerCase() === val.toLowerCase())

const everyInArray = (vals: string[] | null, requested?: string[]) => {
  if (!requested?.length) return true
  if (!vals?.length) return false
  const have = vals.map(v => v.toLowerCase())
  return requested.every(r => have.includes(r.toLowerCase()))
}

const between = (n: number | null, min?: number, max?: number) => {
  if (n == null) return !(min || max) // if no value, only pass when no bounds
  if (min != null && n < min) return false
  if (max != null && n > max) return false
  return true
}

function normalizeLegal(val: string): BanStatus {
  const v = val.toLowerCase()
  if (v === 'banned' || v === 'forbidden') return 'Forbidden'
  if (v === 'limited') return 'Limited'
  if (v === 'semilimited' || v === 'semi-limited' || v === 'semi_limited') return 'Semi-Limited'
  return null
}

// ---- main filter -----------------------------------------------------------

export function cardMatches(card: Card, q: Query): boolean {
  // category
  if (q.category && card.category !== q.category) return false

  // set
  if (q.set?.length) {
    const s = (card.set ?? '').toLowerCase()
    const any = q.set.some(x => s.includes(x.toLowerCase()) || s === x.toLowerCase())
    if (!any) return false
  }

  // archetype
  if (q.archetype?.length && !inArray(card.archetype, q.archetype)) return false

  // icon (spell/trap)
  if (q.icon?.length && !inArray(card.icon ?? null, q.icon)) return false

  // types
  if (!everyInArray(card.cardTypes, q.cardTypes)) return false
  if (!everyInArray(card.monsterType, q.monsterType)) return false

  // attribute
  if (q.attribute?.length && !inArray(card.attribute, q.attribute)) return false

  // stats / bounds
  if (!between(card.level, q.levelMin, q.levelMax)) return false
  if (!between(card.rank,  q.rankMin,  q.rankMax )) return false
  if (!between(card.linkRating, q.linkMin, q.linkMax)) return false
  if (!between(card.scale, q.scaleMin, q.scaleMax)) return false
  if (!between(card.atk,   q.atkMin,   q.atkMax)) return false
  if (!between(card.def,   q.defMin,   q.defMax)) return false

  // link arrows: query values are strings, card values are numbers
  if (q.linkArrows && q.linkArrows.length) {
    const have = card.linkArrows ?? []                 // number[]
    const needed = q.linkArrows
      .map(v => Number(v))
      .filter(n => Number.isFinite(n))                 // number[]
    const allIncluded = needed.every(n => have.includes(n))
    if (!allIncluded) return false
  }

  // legal / ban status (supports multiple values)
  if (q.legal?.length) {
    const wanted = new Set(q.legal.map(normalizeLegal).filter(Boolean))
    if (wanted.size) {
      const status = getBanStatus(card)
      if (!status || !wanted.has(status)) return false
    }
  }

  return true
}

// ---- sorting ---------------------------------------------------------------

export type SortKey = 'name' | 'atk' | 'def' | 'level' | 'rank' | 'link' | 'date'
export type SortDir = 'asc' | 'desc'

export function sortCards(list: Card[], key: SortKey, dir: SortDir): Card[] {
  const cmpNullsLast = <T>(a: T | null, b: T | null) => {
    const an = a === null || a === undefined
    const bn = b === null || b === undefined
    if (an && bn) return 0
    if (an) return 1
    if (bn) return -1
    return 0
  }

  function by<T>(sel: (c: Card) => T | null) {
    const cmp = (a: Card, b: Card) => {
      const va = sel(a) as any
      const vb = sel(b) as any
      const nl = cmpNullsLast(va, vb)
      if (nl !== 0) return nl
      if (va < vb) return -1
      if (va > vb) return 1
      // stable-ish fallback: name
      const na = (a.name || '').toLowerCase()
      const nb = (b.name || '').toLowerCase()
      if (na < nb) return -1
      if (na > nb) return 1
      return 0
    }
    return [...list].sort((a,b) => (dir === 'asc' ? cmp(a,b) : -cmp(a,b)))
  }

  switch (key) {
    case 'atk':   return by(c => c.atk ?? null)
    case 'def':   return by(c => c.def ?? null)
    case 'level': return by(c => c.level ?? null)
    case 'rank':  return by(c => c.rank ?? null)
    case 'link':  return by(c => c.linkRating ?? null)
    case 'date':  return by(c => c.timestamps?.added ?? null) // 'YYYY-MM-DD' sorts lexicographically
    case 'name':
    default:      return by(c => (c.name || '').toLowerCase())
  }
}
