import Fuse from 'fuse.js'
import type { Card } from '../types/card'

const options: Fuse.IFuseOptions<Card> = {
  keys: [
    { name: 'name', weight: 0.5 },
    { name: 'text', weight: 0.3 },
    { name: 'archetype', weight: 0.1 },
    { name: 'keywords', weight: 0.1 },
  ],
  threshold: 0.3,
  ignoreLocation: true,
}

export function makeFuse(cards: Card[]) {
  return new Fuse(cards, options)
}
