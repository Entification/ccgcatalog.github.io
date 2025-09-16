import { useEffect, useMemo, useState } from 'react'
import type { Card, SetInfo } from '../types/card'

export default function useCards(){
  const [cards, setCards] = useState<Card[]>([])
  const [sets, setSets] = useState<SetInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let alive = true
    Promise.all([
      fetch('/src/data/cards.json').then(r=>r.json()),
      fetch('/src/data/sets.json').then(r=>r.json()),
    ]).then(([c,s])=>{ if(alive){ setCards(c); setSets(s); setLoading(false) }})
    return ()=>{ alive=false }
  },[])

  const indexes = useMemo(()=>({
    setsByCode: new Map(sets.map(s=>[s.code, s])),
    archetypes: [...new Set(cards.map(c=>c.archetype).filter(Boolean))] as string[],
    setsList: sets,
  }), [cards, sets])

  return { cards, sets, indexes, loading }
}
