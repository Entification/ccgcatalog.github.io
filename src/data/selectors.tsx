import customCards from "./cards.json";
import type { Card } from "../types/card";

// Card Database should only ever see custom cards
export const DB_CARDS: Card[] = customCards as Card[];
