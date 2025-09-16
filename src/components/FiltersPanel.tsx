import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useCards from '../hooks/useCards'
import clsx from 'clsx'

const CATEGORY = ['Monster', 'Spell', 'Trap'] as const
const ICONS = ['Normal','Quick-Play','Field','Equip','Continuous','Counter','Ritual'] as const
const CARD_TYPES = ['Normal','Effect','Flip','Spirit','Tuner','Pendulum','Fusion','Synchro','Xyz','Link'] as const
const MONSTER_TYPES = [
  'Dragon','Spellcaster','Warrior','Beast','Beast-Warrior','Aqua','Machine','Fairy','Fiend','Zombie','Rock','Plant',
  'Psychic','Thunder','Pyro','Reptile','Sea Serpent','Wyrm','Dinosaur','Cyberse','Illusion','Creator God'
] as const
const ATTRIBUTES = ['LIGHT','DARK','EARTH','WATER','FIRE','WIND','DIVINE'] as const
const LEGAL = ['legal','semi','limited','banned'] as const

const ARROWS = ['T','TR','R','BR','B','BL','L','TL'] as const
type ArrowCode = typeof ARROWS[number]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[12px] font-medium text-neutral-300 tracking-wide">{title}</div>
      {children}
    </div>
  )
}

function Select({
  value, onChange, options, placeholder='Select…',
}: {
  value: string | string[]; onChange: (v: string | string[]) => void;
  options: string[]; placeholder?: string;
}) {
  return (
    <select
      className="bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-sm w-full"
      value={Array.isArray(value) ? (value[0] ?? '') : (value || '')}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function MultiChips({
  value, onChange, options,
}: {
  value: string[]; onChange: (v: string[]) => void; options: string[];
}) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter(x=>x!==opt) : [...value, opt])
  }
  return (
    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-1.5">
      {options.map(opt => {
        const active = value.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={()=>toggle(opt)}
            className={clsx(
              'px-2 py-1 text-[12px] rounded-md border transition select-none truncate',
              active
                ? 'bg-accent/20 border-accent/60 text-accent-200'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700'
            )}
            title={opt}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function RangeWithToggle({
  label, min=0, max, step=1,
  values, onChange,
  enabled, onToggle
}: {
  label: string; min?: number; max: number; step?: number;
  values: [number|'', number|'']; onChange: (v:[number|'', number|''])=>void;
  enabled: boolean; onToggle: (v:boolean)=>void;
}) {
  const [lo, hi] = values
  return (
    <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2">
      <label className="flex items-center gap-2 text-[11px] text-neutral-400 w-16">
        <input
          type="checkbox"
          checked={enabled}
          onChange={e=>onToggle(e.target.checked)}
          className="accent-accent"
        />
        {label}
      </label>

      <div className={clsx("flex items-center gap-1.5", !enabled && "opacity-40 pointer-events-none")}>
        <input
          type="range" min={min} max={max} step={step}
          value={lo === '' ? min : Number(lo)}
          onChange={e=> onChange([Number(e.target.value), hi])}
          className="w-full"
        />
        <input
          type="range" min={min} max={max} step={step}
          value={hi === '' ? max : Number(hi)}
          onChange={e=> onChange([lo, Number(e.target.value)])}
          className="w-full"
        />
      </div>

      <div className={clsx("flex items-center gap-1", !enabled && "opacity-40 pointer-events-none")}>
        <input
          className="w-14 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
          value={lo}
          onChange={e=>{
            const v = e.target.value; onChange([v===''? '': Number(v), hi])
          }}
          placeholder={`${min}`}
        />
        <span className="text-neutral-500 text-xs">–</span>
        <input
          className="w-14 bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-xs"
          value={hi}
          onChange={e=>{
            const v = e.target.value; onChange([lo, v===''? '': Number(v)])
          }}
          placeholder={`${max}`}
        />
      </div>
    </div>
  )
}

/** Compact Link Arrows selector (AND), no visible label */
function LinkArrows({
  value, onChange,
}: {
  value: ArrowCode[];
  onChange: (v: ArrowCode[]) => void;
}) {
  const toggle = (a: ArrowCode) => {
    onChange(value.includes(a) ? (value.filter(x=>x!==a) as ArrowCode[]) : ([...value, a] as ArrowCode[]))
  }

  const cells: { code?: ArrowCode }[] = [
    { code:'TL' }, { code:'T' }, { code:'TR' },
    { code:'L'  }, {             }, { code:'R'  },
    { code:'BL' }, { code:'B' }, { code:'BR' },
  ]

  const tri = (dir: ArrowCode) => {
    const active = value.includes(dir)
    const sz = 'w-7 h-7 md:w-8 md:h-8'
    const base = `rounded bg-neutral-800/70 border border-neutral-700 hover:bg-neutral-700/70 ${sz} transition`
    const ring = active ? 'ring-2 ring-accent/70 bg-accent/20 border-accent/60' : ''
    const polys: Record<ArrowCode,string> = {
      T:  'polygon(50% 0%, 0% 100%, 100% 100%)',
      TR: 'polygon(100% 0%, 100% 100%, 0% 0%)',
      R:  'polygon(100% 50%, 0% 0%, 0% 100%)',
      BR: 'polygon(100% 100%, 0% 100%, 100% 0%)',
      B:  'polygon(50% 100%, 0% 0%, 100% 0%)',
      BL: 'polygon(0% 100%, 0% 0%, 100% 100%)',
      L:  'polygon(0% 50%, 100% 0%, 100% 100%)',
      TL: 'polygon(0% 0%, 100% 0%, 0% 100%)',
    }
    return (
      <button
        key={dir}
        type="button"
        aria-label={dir}
        onClick={()=>toggle(dir)}
        className={`${base} ${ring}`}
        style={{ clipPath: polys[dir] as any }}
      />
    )
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 place-items-center" aria-labelledby="link-arrows-label">
      {/* sr-only label for a11y; not visible */}
      <span id="link-arrows-label" className="sr-only">Link Arrows</span>
      {cells.map((c, i) => c.code ? tri(c.code) : <div key={i} className="w-7 h-7 md:w-8 md:h-8" />)}
    </div>
  )
}

export default function FiltersPanel() {
  const { indexes } = useCards()
  const [params, setParams] = useSearchParams()

  // collapsed state from URL (?filters=0/1); default expanded
  const collapsedFromURL = params.get('filters') === '0'
  const [collapsed, setCollapsed] = useState<boolean>(collapsedFromURL)

  const getA = (k: string) => {
    const v = params.getAll(k)
    if (v.length) return v
    const single = params.get(k)
    return single ? [single] : []
  }
  const setOrDel = (k: string, v?: string | string[] | '' | null) => {
    if (!v || (Array.isArray(v) && v.length===0) || v==='') params.delete(k)
    else if (Array.isArray(v)) { params.delete(k); v.forEach(x=> params.append(k,x)) }
    else params.set(k, v as string)
  }

  // base fields
  const [q, setQ] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('category') || '')
  const [icon, setIcon] = useState(params.get('icon') || '')
  const [attribute, setAttribute] = useState(params.get('attribute') || '')
  const [archetype, setArchetype] = useState(getA('archetype'))
  const [cardTypes, setCardTypes] = useState(getA('cardTypes'))
  const [monsterType, setMonsterType] = useState(getA('monsterType'))
  const [setCode, setSetCode] = useState(params.get('set') || '')
  const [legal, setLegal] = useState<string[]>(getA('legal'))

  // ranges + toggles
  const [atk, setAtk] = useState<[number|'', number|'']>([params.get('atkMin')? Number(params.get('atkMin')):'', params.get('atkMax')? Number(params.get('atkMax')):''])
  const [def, setDef] = useState<[number|'', number|'']>([params.get('defMin')? Number(params.get('defMin')):'', params.get('defMax')? Number(params.get('defMax')):''])
  const [level, setLevel] = useState<[number|'', number|'']>([params.get('levelMin')? Number(params.get('levelMin')):'', params.get('levelMax')? Number(params.get('levelMax')):''])
  const [rank, setRank] = useState<[number|'', number|'']>([params.get('rankMin')? Number(params.get('rankMin')):'', params.get('rankMax')? Number(params.get('rankMax')):''])
  const [link, setLink] = useState<[number|'', number|'']>([params.get('linkMin')? Number(params.get('linkMin')):'', params.get('linkMax')? Number(params.get('linkMax')):''])
  const [scale, setScale] = useState<[number|'', number|'']>([params.get('scaleMin')? Number(params.get('scaleMin')):'', params.get('scaleMax')? Number(params.get('scaleMax')):''])

  const [useAtk, setUseAtk] = useState(params.has('atkMin') || params.has('atkMax'))
  const [useDef, setUseDef] = useState(params.has('defMin') || params.has('defMax'))
  const [useLevel, setUseLevel] = useState(params.has('levelMin') || params.has('levelMax'))
  const [useRank, setUseRank] = useState(params.has('rankMin') || params.has('rankMax'))
  const [useLink, setUseLink] = useState(params.has('linkMin') || params.has('linkMax'))
  const [useScale, setUseScale] = useState(params.has('scaleMin') || params.has('scaleMax'))

  const [linkArrows, setLinkArrows] = useState<ArrowCode[]>(getA('linkArrows') as ArrowCode[])

  useEffect(()=>{ setQ(params.get('q')||'') }, [params])

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    if (next) params.set('filters', '0'); else params.set('filters', '1')
    setParams(params, { replace: true })
  }

  const apply = () => {
    setOrDel('q', q)
    setOrDel('category', category)
    setOrDel('icon', icon)
    setOrDel('attribute', attribute)
    setOrDel('set', setCode)
    setOrDel('archetype', archetype)
    setOrDel('cardTypes', cardTypes)
    setOrDel('monsterType', monsterType)
    setOrDel('legal', legal)
    setOrDel('linkArrows', linkArrows)

    const putRange = (name: string, enabled: boolean, [lo, hi]: [number|'', number|''])=>{
      if (!enabled) {
        params.delete(`${name}Min`)
        params.delete(`${name}Max`)
        return
      }
      setOrDel(`${name}Min`, lo===''? null : String(lo))
      setOrDel(`${name}Max`, hi===''? null : String(hi))
    }
    putRange('atk',   useAtk,   atk)
    putRange('def',   useDef,   def)
    putRange('level', useLevel, level)
    putRange('rank',  useRank,  rank)
    putRange('link',  useLink,  link)
    putRange('scale', useScale, scale)

    params.set('filters', collapsed ? '0' : '1')
    setParams(params, { replace: true })
  }

  const reset = () => {
    const keepCollapsed = collapsed ? '0' : '1'
    setParams(new URLSearchParams({ filters: keepCollapsed }), { replace:true })

    setQ(''); setCategory(''); setIcon(''); setAttribute(''); setSetCode('')
    setArchetype([]); setCardTypes([]); setMonsterType([]); setLegal([])
    setAtk(['','']); setDef(['','']); setLevel(['','']); setRank(['','']); setLink(['','']); setScale(['',''])
    setUseAtk(false); setUseDef(false); setUseLevel(false); setUseRank(false); setUseLink(false); setUseScale(false)
    setLinkArrows([])
  }

  const archetypesFromData = useMemo(
    () => indexes.archetypes ?? [],
    [indexes.archetypes]
  )

  return (
    <div className="card mb-4">
      {/* Row 1: search + set + actions + collapse toggle */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <input
          placeholder="Search keyword/name/text…"
          value={q}
          onChange={e=>setQ(e.target.value)}
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        />
        <Select
          value={setCode}
          onChange={v=>setSetCode(v as string)}
          options={indexes.setsList.map(s=>`${s.code}`)}
          placeholder="All Sets"
        />
        <div className="flex gap-2">
          <button className="btn" onClick={toggleCollapsed}>
            {collapsed ? 'Show Filters' : 'Hide Filters'}
          </button>
          <button className="btn" onClick={reset}>Reset</button>
          <button className="btn btn-primary" onClick={apply}>Apply</button>
        </div>
      </div>

      {/* Hidden when collapsed */}
      {!collapsed && (
        <>
          {/* Row 2: core dropdowns */}
          <div className="grid md:grid-cols-4 gap-3 mt-4">
            <Section title="Category">
              <Select value={category} onChange={v=>setCategory(v as string)} options={[...CATEGORY]} placeholder="Any" />
            </Section>
            <Section title="Icon">
              <Select value={icon} onChange={v=>setIcon(v as string)} options={[...ICONS]} placeholder="Any" />
            </Section>
            <Section title="Attribute">
              <Select value={attribute} onChange={v=>setAttribute(v as string)} options={[...ATTRIBUTES]} placeholder="Any" />
            </Section>
            <Section title="Archetype">
              <Select value={archetype[0] || ''} onChange={v=>setArchetype(v ? [v as string] : [])} options={archetypesFromData} placeholder="Any" />
            </Section>
          </div>

          {/* Row 3: LEFT = Card Types + Legality, RIGHT = Monster Types */}
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-4">
              <Section title="Card Types">
                <MultiChips value={cardTypes} onChange={setCardTypes} options={[...CARD_TYPES]} />
              </Section>
              <Section title="Legality">
                <MultiChips value={legal} onChange={setLegal} options={[...LEGAL]} />
              </Section>
            </div>

            <Section title="Monster Types">
              <MultiChips value={monsterType} onChange={setMonsterType} options={[...MONSTER_TYPES]} />
            </Section>
          </div>

          {/* Row 4: numeric ranges + Link Arrows (inline, no label) */}
          <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-4 mt-4 items-end">
            <div className="space-y-2.5">
              <RangeWithToggle label="ATK"   min={0} max={6000} step={100} values={atk}   onChange={setAtk}   enabled={useAtk}   onToggle={setUseAtk} />
              <RangeWithToggle label="DEF"   min={0} max={6000} step={100} values={def}   onChange={setDef}   enabled={useDef}   onToggle={setUseDef} />
              <RangeWithToggle label="Scale" min={0} max={13}   step={1}   values={scale} onChange={setScale} enabled={useScale} onToggle={setUseScale} />
            </div>
            <div className="space-y-2.5">
              <RangeWithToggle label="Level" min={0} max={12} step={1} values={level} onChange={setLevel} enabled={useLevel} onToggle={setUseLevel} />
              <RangeWithToggle label="Rank"  min={0} max={13} step={1} values={rank}  onChange={setRank}  enabled={useRank}  onToggle={setUseRank} />
              <RangeWithToggle label="Link"  min={0} max={6}  step={1} values={link}  onChange={setLink}  enabled={useLink}  onToggle={setUseLink} />
            </div>

            {/* Inline with ranges; no visible label */}
            <div className="lg:self-end">
              <span id="link-arrows-label" className="sr-only">Link Arrows</span>
              <LinkArrows value={linkArrows} onChange={setLinkArrows} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
