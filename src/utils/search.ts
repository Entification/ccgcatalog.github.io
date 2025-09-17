import Fuse, { type IFuseOptions } from "fuse.js";
import type { Card } from "../types/card";

const options: IFuseOptions<Card> = {
  keys: [
    "name",
    "archetype",
    "set",
    "category",
    "attribute",
    "text",
    "keywords",
    "monsterType",
    "cardTypes",
  ],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: false,
  useExtendedSearch: false,
  minMatchCharLength: 2, // optional: reduce 1-letter noise
};

export function makeFuse(cards: Card[]) {
  return new Fuse(cards, options);
}
