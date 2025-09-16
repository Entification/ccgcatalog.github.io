import * as React from "react";
import useCards from "./useCards";

export default function useBanlistCards() {
  const { cards: custom, loading: loadingCustom, error: customError } = useCards();
  const [tcg, setTcg] = React.useState<any[]>([]);
  const [loadingTcg, setLoadingTcg] = React.useState(true);
  const [tcgError, setTcgError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        // Code-split: only fetched on the Ban List page
        const mod = await import("../data/tcg-cards.json");
        if (!alive) return;
        setTcg((mod as any).default || []);
      } catch (e: any) {
        if (alive) setTcgError(e);
      } finally {
        if (alive) setLoadingTcg(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const cards = React.useMemo(() => {
    // dedupe by id (custom wins on conflict)
    const map = new Map<string, any>();
    for (const c of tcg) map.set(c.id, c);
    for (const c of custom) map.set(c.id, c);
    return Array.from(map.values());
  }, [custom, tcg]);

  return {
    cards,
    loading: loadingCustom || loadingTcg,
    error: customError || tcgError
  };
}
