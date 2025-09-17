import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import useCards from "../hooks/useCards";
import { makeFuse } from "../utils/search";
import {
  cardMatches,
  sortCards,
  type Query,
  type SortKey,
  type SortDir,
} from "../utils/filters";

import FiltersPanel from "../components/FiltersPanel";
import CardsToolbar from "../components/CardsToolbar";
import VirtualizedCards from "../components/VirtualizedCards";
import VirtualizedCardList from "../components/VirtualizedCardList";

export default function Cards() {
  const { cards, loading, error } = useCards({ includeTCG: false, includeCustom: true, includeTest: false });
  const [params] = useSearchParams();

  const getAll = (k: string) => params.getAll(k);
  const getNum = (k: string) => {
    const v = params.get(k);
    if (v == null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  // search & sorting params
  const qStr = params.get("q") || "";

  const allowedSort: SortKey[] = ["name", "atk", "def", "level", "rank", "link", "date"];
  const sortParam = (params.get("sort") || "name") as string;
  const sort: SortKey = allowedSort.includes(sortParam as SortKey)
    ? (sortParam as SortKey)
    : "name";

  const defaultDir: SortDir = sort === "name" ? "asc" : "desc";
  const dirParam = (params.get("dir") as SortDir) || defaultDir;
  const sortDir: SortDir = dirParam === "asc" || dirParam === "desc" ? dirParam : defaultDir;

  const view = (params.get("view") as "grid" | "list") || "grid";

  const filterQuery: Query = useMemo(() => {
    const category = (params.get("category") as Query["category"]) || "";
    const set = params.get("set") ? [params.get("set")!] : [];
    const q: Query = {
      q: qStr || undefined,
      set,
      archetype: getAll("archetype"),
      category,
      icon: getAll("icon").length ? getAll("icon") : params.get("icon") ? [params.get("icon")!] : [],
      cardTypes: getAll("cardTypes"),
      monsterType: getAll("monsterType"),
      attribute: getAll("attribute").length
        ? getAll("attribute")
        : params.get("attribute")
          ? [params.get("attribute")!]
          : [],
      levelMin: getNum("levelMin"),
      levelMax: getNum("levelMax"),
      rankMin: getNum("rankMin"),
      rankMax: getNum("rankMax"),
      linkMin: getNum("linkMin"),
      linkMax: getNum("linkMax"),
      scaleMin: getNum("scaleMin"),
      scaleMax: getNum("scaleMax"),
      atkMin: getNum("atkMin"),
      atkMax: getNum("atkMax"),
      defMin: getNum("defMin"),
      defMax: getNum("defMax"),
      legal: getAll("legal"),
      linkArrows: getAll("linkArrows"),
      sort,
      view,
    };

    (["archetype", "icon", "cardTypes", "monsterType", "attribute", "legal", "linkArrows"] as const)
      .forEach((k) => {
        const arr = (q as any)[k] as string[] | undefined;
        if (arr && arr.length === 0) delete (q as any)[k];
      });
    if (!q.set?.length) delete (q as any).set;
    if (!q.category) delete (q as any).category;
    return q;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const results = useMemo(() => {
    if (loading || error) return [] as typeof cards;
    let pool = cards;
    if (qStr) {
      const fuse = makeFuse(cards);
      pool = fuse.search(qStr).map((r) => r.item);
    }
    const filtered = pool.filter((c) => cardMatches(c, filterQuery));
    return sortCards(filtered, sort, sortDir);
  }, [cards, loading, error, qStr, filterQuery, sort, sortDir]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load cards.</div>;

  return (
    <div>
      <FiltersPanel />
      <CardsToolbar total={results.length} />
      {view === "list" ? (
        <VirtualizedCardList items={results} />
      ) : (
        <div className="h-[calc(100vh-12rem)]">
          <VirtualizedCards items={results} />
        </div>
      )}
    </div>
  );
}
