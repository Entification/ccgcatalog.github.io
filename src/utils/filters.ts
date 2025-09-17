// src/utils/filters.ts
import type { Card } from "../types/card";

/** Filter query coming from URL params */
export type Query = {
  q?: string;                         // handled by fuse in search.ts
  set?: string | string[];            // match by set CODE (e.g., "DOTE")

  archetype?: string[] | string;      // dropdown uses single value, but accept both
  category?: ("Monster" | "Spell" | "Trap") | "";
  icon?: string[];
  attribute?: string[];

  /** Monster species, e.g., "Dragon", "Machine" */
  monsterType?: string[];
  /** Card subtypes, e.g., "Effect","Fusion","Synchro","Xyz","Link","Pendulum" */
  cardTypes?: string[];

  // single-value selectors map to min==max
  levelMin?: number; levelMax?: number;
  rankMin?: number;  rankMax?: number;
  linkMin?: number;  linkMax?: number;
  scaleMin?: number; scaleMax?: number;

  atkMin?: number;   atkMax?: number;
  defMin?: number;   defMax?: number;

  /** Legalities: ["banned","limited","semi","legal"] */
  legal?: string[];

  /** Link arrows (codes TL,T,TR,L,R,BL,B,BR or keypad 1..9); AND semantics */
  linkArrows?: string[];

  /** Added/timestamps range (YYYY-MM-DD) */
  dateStart?: string;
  dateEnd?: string;

  sort?: SortKey;
  view?: "grid" | "list";
};

type BanStatus = "banned" | "limited" | "semi" | "legal";

const norm = (s?: string | null) => (s ?? "").toString().trim().toUpperCase();
const arr  = (v?: string[] | null) => (Array.isArray(v) ? v : []).map((x) => norm(x)).filter(Boolean);
const toArray = (v?: string | string[] | null) =>
  (Array.isArray(v) ? v : v ? [v] : []).map((x) => norm(x)).filter(Boolean);

function inSet(val: string | null, wanted?: string[] | string) {
  const list = toArray(wanted as any);
  if (list.length === 0) return true;
  return new Set(list).has(norm(val));
}
function listHas(cardVals?: string[] | null, wanted?: string[] | null) {
  const have = new Set(arr(cardVals));
  const need = arr(wanted);
  if (need.length === 0) return true;
  return need.some((x) => have.has(x));
}
function inRange(n: number | null | undefined, lo?: number, hi?: number) {
  if (lo == null && hi == null) return true;
  if (n == null) return false;
  if (lo != null && n < lo) return false;
  if (hi != null && n > hi) return false;
  return true;
}
function normalizeLegal(v: string): BanStatus | null {
  const s = norm(v);
  if (s === "BANNED" || s === "FORBIDDEN") return "banned";
  if (s === "LIMITED" || s === "LIMIT") return "limited";
  if (s === "SEMI-LIMITED" || s === "SEMILIMITED" || s === "SEMI") return "semi";
  if (s === "UNLIMITED" || s === "LEGAL") return "legal";
  return null;
}
/** keypad 1..9 → arrow codes; pass-through for TL/T/... */
function normalizeArrow(v: string | number): string {
  const s = String(v).toUpperCase().trim();
  const map: Record<string, string> = {
    "1": "TL", "2": "T", "3": "TR",
    "4": "L",             "6": "R",
    "7": "BL", "8": "B", "9": "BR",
  };
  return map[s] || s;
}
/** Extract CODE from "TATA", "TATA-001", "CMOG-EN001", "DOTE001", "TATA-001 Something" */
function getSetCode(val: unknown): string | null {
  if (!val) return null;
  const s = String(val).toUpperCase().trim();
  if (/^[A-Z]{3,6}$/.test(s)) return s;
  const first = s.split(/\s+/)[0];
  const m = first.match(/^([A-Z]{3,6})/);
  return m ? m[1] : null;
}
function matchesSet(cardSet: unknown, wanted: string | string[] | undefined) {
  const wantedCodes = toArray(wanted);
  if (wantedCodes.length === 0) return true;
  const code = getSetCode(cardSet);
  return code ? wantedCodes.includes(code) : false;
}
function getBanStatus(card: Card): BanStatus | null {
  const l: any = (card as any).legal;
  if (!l) return null;
  if (l.banned) return "banned";
  if (l.limited) return "limited";
  if (l.semiLimited) return "semi";
  return "legal";
}
function dateInRange(iso?: string, start?: string, end?: string) {
  if (!start && !end) return true;
  if (!iso) return false;
  const d = iso.slice(0, 10); // YYYY-MM-DD
  if (start && d < start) return false;
  if (end && d > end) return false;
  return true;
}

/** Main predicate used by Cards.tsx */
export function cardMatches(card: Card, q: Query): boolean {
  // set (by CODE)
  if (!matchesSet((card as any).set, q.set)) return false;

  // archetype / category / icon / attribute
  if (!inSet(card.archetype as any, q.archetype)) return false;
  if (q.category && norm(card.category) !== norm(q.category)) return false;
  if (!inSet(card.icon as any, q.icon as any)) return false;
  if (!inSet(card.attribute as any, q.attribute as any)) return false;

  // card & monster types (OR semantics)
  if (!listHas((card.cardTypes as any) || null, q.cardTypes || null)) return false;
  if (!listHas((card.monsterType as any) || null, q.monsterType || null)) return false;

  // numeric ranges (single-value selectors are encoded as min==max)
  if (!inRange(card.level ?? null, q.levelMin, q.levelMax)) return false;
  if (!inRange(card.rank ?? null, q.rankMin, q.rankMax)) return false;
  if (!inRange(card.linkRating ?? null, q.linkMin, q.linkMax)) return false;
  if (!inRange(card.scale ?? null, q.scaleMin, q.scaleMax)) return false;
  if (!inRange(card.atk ?? null, q.atkMin, q.atkMax)) return false;
  if (!inRange(card.def ?? null, q.defMin, q.defMax)) return false;

  // link arrows (exclusive AND: card must include *all* selected arrows)
  if (q.linkArrows && q.linkArrows.length) {
    const have = new Set(((card as any).linkArrows ?? []).map((v: any) => normalizeArrow(v)));
    for (const n of q.linkArrows.map((v) => normalizeArrow(v))) {
      if (!have.has(n)) return false;
    }
  }

  // legality
  if (q.legal && q.legal.length) {
    const wanted = new Set(q.legal.map(normalizeLegal).filter((x): x is BanStatus => !!x));
    if (wanted.size) {
      const status = getBanStatus(card);
      if (!status || !wanted.has(status)) return false;
    }
  }

  // date added
  if (!dateInRange(card.timestamps?.added, q.dateStart, q.dateEnd)) return false;

  return true;
}

// ---------------- sorting ----------------
export type SortKey = "name" | "atk" | "def" | "level" | "rank" | "link" | "date";
export type SortDir = "asc" | "desc";

export function sortCards(items: Card[], key: SortKey, dir: SortDir): Card[] {
  const mul = dir === "desc" ? -1 : 1;
  const cmp = <T>(a: T, b: T) => (a === b ? 0 : a > b ? 1 : -1);

  const by = <T>(sel: (c: Card) => T) =>
    [...items].sort((a, b) => {
      const va = sel(a) as any;
      const vb = sel(b) as any;
      const na = va == null, nb = vb == null;
      if (na && nb) return 0;
      if (na) return 1;
      if (nb) return -1;
      return mul * cmp(va, vb);
    });

  switch (key) {
    case "atk":   return by((c) => c.atk ?? null);
    case "def":   return by((c) => c.def ?? null);
    case "level": return by((c) => c.level ?? null);
    case "rank":  return by((c) => c.rank ?? null);
    case "link":  return by((c) => c.linkRating ?? null);
    case "date":  return by((c) => c.timestamps?.added ?? "");
    case "name":
    default:      return by((c) => (c.name || "").toLowerCase());
  }
}
