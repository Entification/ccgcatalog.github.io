// src/hooks/useCards.ts
import { useEffect, useMemo, useState } from "react";
import { asset } from "../utils/assets";
import type { Card } from "../types/card";

type SetMeta = { code: string; [k: string]: unknown };

export type UseCardsOptions = {
  /** Include the large TCG dataset (default: true) */
  includeTCG?: boolean;
  /** Include your custom cards from cards.json (default: true) */
  includeCustom?: boolean;
  /** Include optional test cards (cards.test.json / "cards - test.json") (default: false) */
  includeTest?: boolean;
};

type UseCardsReturn = {
  cards: Card[];
  sets: SetMeta[];
  indexes: {
    setsByCode: Map<string, SetMeta>;
    archetypes: string[];
    byId: Map<string, Card>;
    /** Filtered to sets present in the current `cards` (falls back to all sets if none detected) */
    setsList: SetMeta[];
  };
  loading: boolean;
  error: unknown | null;
};

// -------------------- module-level caches (avoid reloading) -------------------
let tcgCache: Card[] | null = null;
let customCache: Card[] | null = null;
let testCache: Card[] | null = null;
let setsCache: SetMeta[] | null = null;

let inflightTCG: Promise<Card[]> | null = null;
let inflightCustom: Promise<Card[]> | null = null;
let inflightTest: Promise<Card[]> | null = null;
let inflightSets: Promise<SetMeta[]> | null = null;

// -------------------- dataset loaders (public first, src fallback) -----------
async function loadTCG(signal?: AbortSignal): Promise<Card[]> {
  const url = asset("assets/tcg/tcg-cards.json");
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as Card[];
  } catch {
    const mod = await import("../data/tcg-cards.json");
    return ((mod as any).default ?? (mod as any)) as Card[];
  }
}

async function loadSets(signal?: AbortSignal): Promise<SetMeta[]> {
  const url = asset("assets/sets.json");
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as SetMeta[];
  } catch {
    const mod = await import("../data/sets.json");
    return ((mod as any).default ?? (mod as any)) as SetMeta[];
  }
}

async function loadCustom(signal?: AbortSignal): Promise<Card[]> {
  const url = asset("assets/cards.json");
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return (await res.json()) as Card[];
  } catch {
    const mod = await import("../data/cards.json");
    return ((mod as any).default ?? (mod as any)) as Card[];
  }
}

async function loadTest(signal?: AbortSignal): Promise<Card[]> {
  // Preferred name
  const url1 = asset("assets/cards.test.json");
  try {
    const res = await fetch(url1, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url1}`);
    return (await res.json()) as Card[];
  } catch {
    // Legacy file name with a space
    const url2 = asset("assets/cards - test.json");
    try {
      const res2 = await fetch(url2, { signal });
      if (!res2.ok) throw new Error(`HTTP ${res2.status} for ${url2}`);
      return (await res2.json()) as Card[];
    } catch {
      try {
        const m1 = await import("../data/cards.json");
        return ((m1 as any).default ?? (m1 as any)) as Card[];
      } catch {
        const m2 = await import("../data/cards - test.json");
        return ((m2 as any).default ?? (m2 as any)) as Card[];
      }
    }
  }
}

// -------------------- helpers -------------------------------------------------
function ensurePrefixedIds(cards: Card[], prefix: string): Card[] {
  return cards.map((c) => {
    const id = (c as any).id ? String((c as any).id) : "";
    const safeId = id && id.startsWith(prefix) ? id : `${prefix}${id || randomId()}`;
    return { ...c, id: safeId };
  });
}
const ensureCustomIds = (cards: Card[]) => ensurePrefixedIds(cards, "CUSTOM-");
const ensureTestIds = (cards: Card[]) => ensurePrefixedIds(cards, "TEST-");

function randomId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

async function ensureSets(signal?: AbortSignal) {
  if (setsCache) return;
  if (!inflightSets) {
    inflightSets = loadSets(signal).then((v) => {
      setsCache = v;
      return v;
    });
  }
  await inflightSets;
}

async function ensureCustom(signal?: AbortSignal) {
  if (customCache) return;
  if (!inflightCustom) {
    inflightCustom = loadCustom(signal).then((v) => {
      customCache = ensureCustomIds(v);
      return customCache;
    });
  }
  await inflightCustom;
}

async function ensureTest(signal?: AbortSignal) {
  if (testCache) return;
  if (!inflightTest) {
    inflightTest = loadTest(signal).then((v) => {
      testCache = ensureTestIds(v);
      return testCache;
    });
  }
  await inflightTest;
}

async function ensureTCG(signal?: AbortSignal) {
  if (tcgCache) return;
  if (!inflightTCG) {
    inflightTCG = loadTCG(signal).then((v) => {
      tcgCache = v;
      return v;
    });
  }
  await inflightTCG;
}

// -------------------- main hook ----------------------------------------------
export default function useCards(opts: UseCardsOptions = {}): UseCardsReturn {
  const {
    includeTCG = true,
    includeCustom = true,
    includeTest = false,
  } = opts;

  const [cards, setCards] = useState<Card[]>([]);
  const [sets, setSets] = useState<SetMeta[]>(() => setsCache ?? []);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setLoading(true);

        // Sets metadata is generally useful
        await ensureSets(ac.signal);

        const tasks: Promise<any>[] = [];
        if (includeCustom) tasks.push(ensureCustom(ac.signal));
        if (includeTest) tasks.push(ensureTest(ac.signal));
        if (includeTCG) tasks.push(ensureTCG(ac.signal));
        await Promise.all(tasks);

        const combined: Card[] = [
          ...(includeCustom ? customCache ?? [] : []),
          ...(includeTest ? testCache ?? [] : []),
          ...(includeTCG ? tcgCache ?? [] : []),
        ];

        setCards(combined);
        setSets(setsCache ?? []);
        setError(null);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [includeTCG, includeCustom, includeTest]);

  const indexes = useMemo(() => {
    const setsByCode = new Map<string, SetMeta>(sets.map((s) => [String(s.code), s]));
    const byId = new Map<string, Card>(
      cards.map((c) => [String((c as any).id ?? (c as any).code ?? (c as any).name).toUpperCase(), c])
    );
    const archetypes = [...new Set(cards.map((c: any) => c?.archetype).filter(Boolean))] as string[];

    // Robustly guess a set CODE from a card's "set" field:
    //  - Accept plain codes like "TATA"
    //  - Accept forms like "TATA-001", "CMOG-EN001", "DOTE001", "TATA-001 Tainted Tales"
    const getSetCode = (val: unknown): string | null => {
      if (!val) return null;
      const s = String(val).toUpperCase().trim();
      // looks like a plain code already
      if (/^[A-Z]{3,6}$/.test(s)) return s;
      // take the first token, then the leading letters
      const first = s.split(/\s+/)[0]; // e.g., "TATA-001"
      const m = first.match(/^([A-Z]{3,6})/);
      return m ? m[1] : null;
    };

    const presentCodes = new Set(
      cards
        .map((c: any) => getSetCode(c?.set))
        .filter(Boolean) as string[]
    );

    // Prefer sets actually used by the current `cards`
    let setsList = (setsCache ?? []).filter((s) =>
      presentCodes.has(String(s.code).toUpperCase())
    );

    // If none detected, fall back to all sets so the dropdown never disappears
    if (setsList.length === 0) setsList = setsCache ?? [];

    return { setsByCode, archetypes, byId, setsList };
  }, [cards, sets]);

  return { cards, sets, indexes, loading, error };
}
