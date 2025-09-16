// src/types/card.ts

// --- banlist flags (optional) ---
export type Legal = {
  semiLimited?: boolean; // true if semi-limited
  limited?: boolean;     // true if limited
  banned?: boolean;      // true if forbidden
};

// --- timestamps (optional) ---
export type Timestamps = {
  added?: string; // YYYY-MM-DD (e.g., "2025-01-17")
};

// --- basic enums ---
export type CardCategory = 'Monster' | 'Spell' | 'Trap';

export type SpellTrapIcon =
  | 'Normal'      // Spell/Trap: Normal
  | 'Quick-Play'  // Spell: Quick-Play
  | 'Field'       // Spell: Field
  | 'Equip'       // Spell: Equip
  | 'Continuous'  // Spell/Trap: Continuous
  | 'Counter'     // Trap: Counter
  | 'Ritual';     // Spell: Ritual

/**
 * Unified card model for Custom + TCG entries.
 * Matches your JSON shape exactly (nullable where unknown).
 */
export interface Card {
  id: string;                     // unique id (e.g., "CARD-0001", "TCG-NUMBER-95-...")
  name: string;                   // display name (ALL CAPS OK)
  image: string;                  // image path, e.g. "/assets/cards/NAME.jpg" or "/assets/tcg/SLUG.jpg"

  set: string | null;             // set code + name or null (TCG-only entries can be null)
  archetype: string | null;       // e.g., "Stardrake" or null

  category: CardCategory;         // "Monster" | "Spell" | "Trap"
  icon: SpellTrapIcon | null;     // Spell/Trap icon or null for Monsters / unknown

  cardTypes: string[] | null;     // Monster subtypes (e.g., ["Effect","Xyz"]) or null for Spell/Trap
  monsterType: string[] | null;   // e.g., ["Machine"], null for Spell/Trap
  attribute: string | null;       // e.g., "DARK" | "EARTH" | null (Spell/Trap -> null)

  level: number | null;           // Main Deck monsters: Level (or null)
  rank: number | null;            // Xyz monsters: Rank (or null)
  linkRating: number | null;      // Link monsters: Link rating (or null)
  linkArrows: number[] | null;    // Link monsters: arrow indices (or null)
  scale: number | null;           // Pendulum: scale (or null)

  atk: number | null;             // ATK value or null
  def: number | null;             // DEF value or null (Link has no DEF -> null)

  text: string | null;            // effect text or null
  keywords: string[] | null;      // tags like ["ban:new", "ban:was-limited"] or null

  legal?: Legal;                  // optional banlist flags
  timestamps?: Timestamps;        // optional timestamps (e.g., { added: "2025-01-17" })
}

// --- helpers (optional) ---
export type BanStatus = 'Forbidden' | 'Limited' | 'Semi-Limited' | null;

export function getBanStatus(c: Card): BanStatus {
  const l = c.legal;              // read banlist flags
  if (!l) return null;            // no flags -> no status
  if (l.banned) return 'Forbidden';
  if (l.limited) return 'Limited';
  if (l.semiLimited) return 'Semi-Limited';
  return null;
}

// --- optional set metadata for your UI ---
export interface SetInfo {
  code: string;                   // e.g., "TATA-001"
  name: string;                   // e.g., "Tainted Tails"
  releaseDate?: string;           // "YYYY-MM-DD" (optional)
  description?: string;           // set description (optional)
  coverImage?: string;            // e.g., "/assets/sets/TATA-001.jpg" (optional)
}
