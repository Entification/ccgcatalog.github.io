export type Legal = {
  semiLimited?: boolean;
  limited?: boolean;
  banned?: boolean;
}

export type Card = {
  id: string;
  name: string;
  image: string;             // e.g. /assets/cards/Name.jpeg
  set: string;               // e.g. CCG-01 Brave X
  archetype?: string;
  category: 'Monster' | 'Spell' | 'Trap';
  icon?: 'Normal' | 'Quick-Play' | 'Field' | 'Equip' | 'Continuous' | 'Counter' | 'Ritual';
  cardTypes?: string[];      // Effect, Tuner, Pendulum, Fusion, Synchro, Xyz, Link, etc.
  monsterType?: string[];    // Dragon, Aqua, Beast, etc.
  attribute?: 'LIGHT'|'DARK'|'EARTH'|'WATER'|'FIRE'|'WIND'|'DIVINE';
  level?: number | null;
  rank?: number | null;
  linkRating?: number | null;
  linkArrows?: string[];     // 'T','B','L','R','TR','TL','BR','BL'
  scale?: number | null;     // 1–12
  atk?: number | null;
  def?: number | null;
  text?: string;
  keywords?: string[];
  legal?: Legal;
  timestamps?: { added?: string };
}


export type BanStatus = "Forbidden" | "Limited" | "Semi-Limited" | null;

export function getBanStatus(c: Card): BanStatus {
  if (!c.legal) return null;
  if (c.legal.banned) return "Forbidden";
  if (c.legal.limited) return "Limited";
  if (c.legal.semiLimited) return "Semi-Limited";
  return null;
}

export type SetInfo = {
  code: string;              // CCG-01
  name: string;              // Brave X
  releaseDate?: string;      // YYYY-MM-DD
  description?: string;
  coverImage?: string;       // /assets/sets/CCG-01.jpg
}
