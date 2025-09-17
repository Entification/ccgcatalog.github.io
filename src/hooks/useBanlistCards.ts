// src/hooks/useBanlistCards.ts
import { useEffect, useMemo, useState } from "react";
import { asset } from "../utils/assets";
import type { Card } from "../types/card";

type Legal = {
  banned?: boolean;
  limited?: boolean;
  semiLimited?: boolean;
};

type UseBanlistReturn = {
  legalById: Map<string, Legal>;
  legalByName: Map<string, Legal>;
  legalFor: (card: Pick<Card, "id" | "name">) => Legal | null;
  withLegal: <T extends Card>(cards: T[]) => (T & { legal?: Legal })[];
  loading: boolean;
  error: unknown | null;
};

// module-level cache
let banIndexCache: { byId: Map<string, Legal>; byName: Map<string, Legal> } | null = null;
let inflight: Promise<void> | null = null;

function toLegal(status: unknown): Legal | null {
  const s = String(status || "").toLowerCase().trim();
  if (!s) return null;
  if (s === "banned" || s === "forbidden") return { banned: true };
  if (s === "limited" || s === "limit") return { limited: true };
  if (s === "semi-limited" || s === "semilimited" || s === "semi") return { semiLimited: true };
  if (s === "unlimited" || s === "legal") return {};
  return null;
}

function buildIndex(raw: any, format: string): { byId: Map<string, Legal>; byName: Map<string, Legal> } {
  const byId = new Map<string, Legal>();
  const byName = new Map<string, Legal>();
  const F = format;

  // Case A: object keyed by id or name → value is status or { TCG:"banned", ... }
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, val] of Object.entries(raw)) {
      const status =
        (val as any)?.[F] ??
        (val as any)?.status ??
        (typeof val === "string" ? val : undefined);
      const legal = toLegal(status);
      if (!legal) continue;
      const K = key.toUpperCase();
      // If looks like an id (contains dash/upper alnum), index as id; otherwise by name.
      if (/^[A-Z0-9\-_:]+$/.test(K)) byId.set(K, legal);
      else byName.set(K, legal);
    }
  }

  // Case B: array of entries [{ id?, name?, status?, TCG? }]
  if (Array.isArray(raw)) {
    for (const e of raw) {
      const key = (e?.id ?? e?.code ?? e?.name)?.toString();
      const status = e?.[F] ?? e?.status;
      const legal = toLegal(status);
      if (!key || !legal) continue;
      const K = key.toUpperCase();
      if (e?.id || e?.code) byId.set(K, legal);
      if (e?.name) byName.set(String(e.name).toUpperCase(), legal);
    }
  }

  return { byId, byName };
}

async function loadBanlistAbortable(signal?: AbortSignal): Promise<any> {
  const url = asset("assets/banlist.json");
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch {
    const mod = await import("../data/banlist.json");
    return (mod as any).default ?? (mod as any);
  }
}

export default function useBanlistCards(format: string = "TCG"): UseBanlistReturn {
  const [idx, setIdx] = useState<{ byId: Map<string, Legal>; byName: Map<string, Legal> } | null>(
    () => banIndexCache
  );
  const [loading, setLoading] = useState<boolean>(() => !banIndexCache);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    if (banIndexCache) return;

    const ac = new AbortController();
    const run = async () => {
      try {
        setLoading(true);
        if (!inflight) {
          inflight = (async () => {
            const raw = await loadBanlistAbortable(ac.signal);
            banIndexCache = buildIndex(raw, format);
          })();
        }
        await inflight;
        setIdx(banIndexCache);
        setError(null);
      } catch (e) {
        if ((e as any)?.name !== "AbortError") setError(e);
      } finally {
        setLoading(false);
        inflight = null;
      }
    };

    run();
    return () => ac.abort();
  }, [format]);

  const { legalById, legalByName } = useMemo(
    () => ({
      legalById: idx?.byId ?? new Map<string, Legal>(),
      legalByName: idx?.byName ?? new Map<string, Legal>(),
    }),
    [idx]
  );

  const legalFor = (card: Pick<Card, "id" | "name">): Legal | null => {
    const idKey = String(card.id ?? "").toUpperCase();
    const nameKey = String(card.name ?? "").toUpperCase();
    return legalById.get(idKey) ?? legalByName.get(nameKey) ?? null;
  };

  const withLegal = <T extends Card>(cards: T[]) =>
    cards.map((c) => {
      const legal = legalFor(c);
      return legal ? { ...c, legal } : c;
    });

  return { legalById, legalByName, legalFor, withLegal, loading, error };
}

