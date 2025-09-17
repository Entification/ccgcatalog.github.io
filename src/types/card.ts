// src/types/card.ts

// ---------- Banlist / legality ----------
export type Legal = {
  semiLimited?: boolean; // true if semi-limited
  limited?: boolean; // true if limited
  banned?: boolean; // true if forbidden
};

// ---------- Timestamps ----------
export type Timestamps = {
  added?: string; // ISO date YYYY-MM-DD (e.g., "2025-01-17")
};

// ---------- Base enums ----------
export type CardCategory = "Monster" | "Spell" | "Trap";

// Attributes used in your data
export type Attribute = "DARK" | "LIGHT" | "FIRE" | "WATER" | "WIND" | "EARTH" | "DIVINE";

// Common Spell/Trap icons (keep string fallback flexible if you import others)
export type SpellTrapIcon =
  | "Normal"
  | "Continuous"
  | "Equip"
  | "Quick-Play"
  | "Field"
  | "Ritual"
  | "Counter"
  | string;

// Monster “card types” (subtypes). Keep string for flexibility.
export type MonsterCardType =
  | "Effect"
  | "Normal"
  | "Fusion"
  | "Synchro"
  | "Xyz"
  | "Link"
  | "Pendulum"
  | "Ritual"
  | "Tuner"
  | "Flip"
  | "Spirit"
  | "Gemini"
  | "Union"
  | "Toon"
  | "Token"
  | string;

// Species/races like "Machine", "Dragon", etc.
export type MonsterSpecies = string;

// Link arrows; keep string compatible with any codes you use
export type LinkArrow =
  | "TL"
  | "T"
  | "TR"
  | "L"
  | "R"
  | "BL"
  | "B"
  | "BR"
  | string;

// ---------- Core Card type ----------
// NOTE: many fields are nullable in your JSON; reflect that here.
export interface Card {
  // identity
  id: string; // e.g., "CARD-0001", "TCG-AGIDO-THE-ANCIENT-SENTINEL"
  name: string; // display name, usually uppercase in your data

  // media
  image: string; // e.g., "/assets/cards/XYZ.jpg" or "/assets/tcg/XYZ.jpg"

  // set & flavor
  set: string | null; // e.g., "TATA-001 Tainted Tails" or null
  archetype: string | null; // e.g., "Stardrake" or null
  text: string | null; // effect text (nullable)
  keywords: string[] | string | null; // if you store searchable keywords

  // classification
  category: CardCategory; // "Monster" | "Spell" | "Trap"
  icon: SpellTrapIcon | null; // Spell/Trap icon or null for Monsters
  cardTypes: MonsterCardType[] | null; // e.g., ["Effect","Xyz"] for Monsters
  monsterType: MonsterSpecies[] | null; // e.g., ["Machine"]

  // stats (nullable for S/T or unknown)
  attribute: Attribute | string | null;
  level: number | null; // Monster level
  rank: number | null; // Xyz rank
  linkRating: number | null; // Link rating
  linkArrows: LinkArrow[] | null;
  scale: number | null; // Pendulum scale
  atk: number | null;
  def: number | null;

  // legality, timestamps
  legal?: Legal;
  timestamps?: Timestamps;
}

// ---------- Type guards / helpers ----------
export const isMonster = (c: Pick<Card, "category">): boolean => c.category === "Monster";

export function typeLine(c: Card): string {
  // Monster: combine species + subtypes; Spell/Trap: use icon or fallback
  if (isMonster(c)) {
    const species = Array.isArray(c.monsterType) ? c.monsterType.join(" / ") : c.monsterType ?? "";
    const sub = Array.isArray(c.cardTypes) ? c.cardTypes.join(" / ") : c.cardTypes ?? "";
    const both = [species, sub].filter(Boolean).join(" / ");
    return both || "Monster";
  }
  return c.icon || c.category;
}

export function levelRankLink(c: Card): string | null {
  if (c.linkRating != null) return `Link ${c.linkRating}`;
  if (c.rank != null) return `Rank ${c.rank}`;
  if (c.level != null) return `Level ${c.level}`;
  return null;
}

export function atkDef(c: Card): string | null {
  if (c.category !== "Monster") return null;
  const atk = c.atk != null ? c.atk : "-";
  const def = c.def != null ? c.def : "-";
  return `ATK ${atk} / DEF ${def}`;
}

export function legalLabel(l?: Legal | null): "Forbidden" | "Limited" | "Semi-Limited" | null {
  if (!l) return null;
  if (l.banned) return "Forbidden";
  if (l.limited) return "Limited";
  if (l.semiLimited) return "Semi-Limited";
  return null;
}

// ---------- Optional set metadata (from src/data/sets.json) ----------
export interface SetInfo {
  code: string; // e.g., "TATA"
  name: string; // e.g., "Tainted Tales"
  releaseDate?: string; // "YYYY-MM-DD"
  description?: string;
  coverImage?: string; // e.g., "/assets/sets/Tainted_Tales_Aldrez.jpg"
}
