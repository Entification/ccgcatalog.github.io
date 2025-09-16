import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import queryString from 'query-string'

import useCards from '../hooks/useCards'
import { makeFuse } from '../utils/search'
import { cardMatches, sortCards, type Query } from '../utils/filters'

import FiltersPanel from '../components/FiltersPanel'
import CardsToolbar from '../components/CardsToolbar'
import VirtualizedCards from '../components/VirtualizedCards'
import VirtualizedCardList from '../components/VirtualizedCardList'

type Dir = 'asc'|'desc'

export default function Cards(){
  const { cards, loading } = useCards()
  const [params] = useSearchParams()

  const getAll = (k: string) => params.getAll(k)
  const getNum = (k: string) => {
    const v = params.get(k)
    if (v == null || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }

  const qStr = params.get('q') || ''
  const sort = params.get('sort') || 'name'
  const defaultDir: Dir = sort === 'name' ? 'asc' : 'desc'
  const sortDir: Dir = ((params.get('dir') as Dir) || defaultDir)
  const view = (params.get('view') as 'grid' | 'list') || 'grid'

  const filterQuery: Query = useMemo(() => {
    const category = (params.get('category') as Query['category']) || ''
    const set = params.get('set') ? [params.get('set')!] : []
    const q: Query = {
      q: qStr || undefined,
      set,
      archetype: getAll('archetype'),
      category,
      icon: getAll('icon').length ? getAll('icon') : (params.get('icon') ? [params.get('icon')!] : []),
      cardTypes: getAll('cardTypes'),
      monsterType: getAll('monsterType'),
      attribute: getAll('attribute').length ? getAll('attribute') : (params.get('attribute') ? [params.get('attribute')!] : []),

      levelMin: getNum('levelMin'),
      levelMax: getNum('levelMax'),
      rankMin:  getNum('rankMin'),
      rankMax:  getNum('rankMax'),
      linkMin:  getNum('linkMin'),
      linkMax:  getNum('linkMax'),
      scaleMin: getNum('scaleMin'),
      scaleMax: getNum('scaleMax'),
      atkMin:   getNum('atkMin'),
      atkMax:   getNum('atkMax'),
      defMin:   getNum('defMin'),
      defMax:   getNum('defMax'),

      legal: getAll('legal'),
      linkArrows: getAll('linkArrows'),

      sort,
      view,
    }

    ;(['archetype','icon','cardTypes','monsterType','attribute','legal','linkArrows'] as const).forEach((k)=>{
      const arr = (q as any)[k] as string[] | undefined
      if (arr && arr.length === 0) delete (q as any)[k]
    })
    if (!q.set?.length) delete (q as any).set
    if (!q.category) delete (q as any).category
    return q
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const results = useMemo(()=>{
    if(loading) return [] as typeof cards
    let pool = cards
    if(qStr){
      const fuse = makeFuse(cards)
      pool = fuse.search(qStr).map(r => r.item)
    }
    const filtered = pool.filter(c => cardMatches(c, filterQuery))
    return sortCards(filtered, sort, sortDir)
  }, [cards, loading, qStr, filterQuery, sort, sortDir])

  if(loading) return <div>Loading…</div>

  return (
    <div>
      <FiltersPanel />
      <CardsToolbar total={results.length} />
      {view === 'list'
        ? <VirtualizedCardList items={results} />
        : <VirtualizedCards items={results} />
      }
    </div>
  )
}
