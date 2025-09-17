
import customCardsRaw from "./cards.json";
import type { Card } from "../types/card";
function withSafeIds(cards: Card[], prefix = "CUSTOM-"): Card[] {
  return cards.map((c) => {
    const id = c.id?.startsWith(prefix) ? c.id : `${prefix}${c.id ?? cryptoRandom()}`;
    return { ...c, id };
  });
}
function cryptoRandom() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export const DB_CUSTOM_CARDS: Card[] = withSafeIds(customCardsRaw as Card[]);
