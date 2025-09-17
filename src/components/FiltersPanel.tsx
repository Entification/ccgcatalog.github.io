// src/components/FiltersPanel.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import useCards from "../hooks/useCards";

const ATTRS = ["DARK", "LIGHT", "EARTH", "WATER", "FIRE", "WIND", "DIVINE"];
const ICONS = ["Equip", "Field", "Quick-Play", "Ritual", "Continuous", "Counter", "Normal"];
const CARD_TYPES = [
  "Normal","Effect","Ritual","Fusion","Synchro","Xyz","Toon",
  "Spirit","Union","Gemini","Tuner","Flip","Pendulum","Link",
];
const LEVELS = Array.from({ length: 14 }, (_, i) => i);      // 0..13
const SCALES = Array.from({ length: 13 }, (_, i) => i + 1);   // 1..13
const LINK_RATINGS = [1, 2, 3, 4, 5, 6];

// 3×3 keypad with a blank center
const ARROWS_GRID: (string | null)[] = [
  "TL", "T",  "TR",
  "L",  null, "R",
  "BL", "B",  "BR",
];

// compact chip
function Chip({
  active,
  onClick,
  children,
  title,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const base =
    "px-2.5 py-1 rounded-md border text-xs leading-5 whitespace-nowrap transition select-none";
  const on = "bg-accent text-white border-accent";
  const off = "bg-neutral-900 text-neutral-200 border-neutral-700 hover:border-neutral-500";
  return (
    <button type="button" title={title} onClick={onClick} className={`${base} ${active ? on : off}`}>
      {children}
    </button>
  );
}

// uniform section (title + optional clear)
function Section({
  title,
  onClear,
  children,
  fixedHeight = false,
}: {
  title: string;
  onClear?: () => void;
  children: React.ReactNode;
  /** when true, body gets fixed height with scroll for symmetry */
  fixedHeight?: boolean;
}) {
  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-medium text-sm text-neutral-200">{title}</h3>
        {onClear && (
          <button
            className="text-xs text-neutral-400 hover:underline"
            onClick={onClear}
            type="button"
          >
            clear
          </button>
        )}
      </div>
      <div className={fixedHeight ? "max-h-24 overflow-auto pr-1" : ""}>{children}</div>
    </section>
  );
}

// url helpers
const getAll = (p: URLSearchParams, k: string) => p.getAll(k);
const getOne = (p: URLSearchParams, k: string) => p.get(k) ?? "";
const getNum = (p: URLSearchParams, k: string) => (p.get(k) ? Number(p.get(k)) : undefined);
const putList = (p: URLSearchParams, k: string, vals: string[]) => {
  p.delete(k);
  for (const v of vals) p.append(k, v);
};

export default function FiltersPanel() {
  // /cards: only custom cards
  const { cards, indexes } = useCards({ includeTCG: false, includeCustom: true, includeTest: false });
  const [params, setParams] = useSearchParams();

  // collapsed state
  const [collapsed, setCollapsed] = useState(params.get("filters") === "0");

  // header row
  const [q, setQ] = useState(getOne(params, "q"));
  const [setCode, setSetCode] = useState(getOne(params, "set"));
  const [archetypeSel, setArchetypeSel] = useState(getOne(params, "archetype"));

  // multi-select chips
  const [attributes, setAttributes] = useState<string[]>(getAll(params, "attribute"));
  const [icons, setIcons] = useState<string[]>(getAll(params, "icon"));
  const [monsterTypes, setMonsterTypes] = useState<string[]>(getAll(params, "monsterType"));
  const [cardTypes, setCardTypes] = useState<string[]>(getAll(params, "cardTypes"));

  // single-value pickers (click toggles on/off)
  const [levelVal, setLevelVal] = useState<number | undefined>(getNum(params, "levelMin"));
  const [rankVal,  setRankVal]  = useState<number | undefined>(getNum(params, "rankMin"));
  const [scaleVal, setScaleVal] = useState<number | undefined>(getNum(params, "scaleMin"));
  const [linkVal,  setLinkVal]  = useState<number | undefined>(getNum(params, "linkMin"));

  // link arrows (multi)
  const [arrows, setArrows] = useState<string[]>(getAll(params, "linkArrows"));

  // atk/def numeric
  const [atkMin, setAtkMin] = useState<number | undefined>(getNum(params, "atkMin"));
  const [atkMax, setAtkMax] = useState<number | undefined>(getNum(params, "atkMax"));
  const [defMin, setDefMin] = useState<number | undefined>(getNum(params, "defMin"));
  const [defMax, setDefMax] = useState<number | undefined>(getNum(params, "defMax"));

  // legality + date
  const [legal, setLegal] = useState<string[]>(getAll(params, "legal"));
  const [dateStart, setDateStart] = useState<string>(getOne(params, "dateStart"));
  const [dateEnd, setDateEnd] = useState<string>(getOne(params, "dateEnd"));

  useEffect(() => { setQ(getOne(params, "q")); }, [params]);

  const setsOptions = useMemo(() => indexes.setsList ?? [], [indexes.setsList]);
  const archetypeOptions = useMemo(
    () => [...new Set(indexes.archetypes ?? [])].sort((a, b) => a.localeCompare(b)),
    [indexes.archetypes]
  );
  const monsterTypeOptions = useMemo(
    () => [...new Set(cards.flatMap((c: any) => c?.monsterType ?? []))].map(String).sort(),
    [cards]
  );

  // togglers
  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };
  const toggleSingle = (current: number | undefined, set: (v?: number) => void, value: number) => {
    set(current === value ? undefined : value);
  };

  const apply = () => {
    const p = new URLSearchParams(params);
    const setOrDel = (k: string, v?: string) => (v ? p.set(k, v) : p.delete(k));
    const setNum = (k: string, v?: number) => (v != null && !Number.isNaN(v) ? p.set(k, String(v)) : p.delete(k));

    setOrDel("q", q.trim() || undefined);
    setOrDel("set", setCode || undefined);
    setOrDel("archetype", archetypeSel || undefined);

    putList(p, "attribute", attributes);
    putList(p, "icon", icons);
    putList(p, "monsterType", monsterTypes);
    putList(p, "cardTypes", cardTypes);

    // single value -> set both min & max to same, or clear both
    if (levelVal != null) { setNum("levelMin", levelVal); setNum("levelMax", levelVal); }
    else { p.delete("levelMin"); p.delete("levelMax"); }
    if (rankVal != null) { setNum("rankMin", rankVal); setNum("rankMax", rankVal); }
    else { p.delete("rankMin"); p.delete("rankMax"); }
    if (scaleVal != null) { setNum("scaleMin", scaleVal); setNum("scaleMax", scaleVal); }
    else { p.delete("scaleMin"); p.delete("scaleMax"); }
    if (linkVal != null) { setNum("linkMin", linkVal); setNum("linkMax", linkVal); }
    else { p.delete("linkMin"); p.delete("linkMax"); }

    putList(p, "linkArrows", arrows);

    setNum("atkMin", atkMin); setNum("atkMax", atkMax);
    setNum("defMin", defMin); setNum("defMax", defMax);

    putList(p, "legal", legal);
    setOrDel("dateStart", dateStart || undefined);
    setOrDel("dateEnd", dateEnd || undefined);

    p.set("filters", collapsed ? "0" : "1");
    setParams(p, { replace: true });
  };

  const reset = () => {
    const p = new URLSearchParams();
    p.set("filters", collapsed ? "0" : "1");
    setParams(p, { replace: true });

    setQ(""); setSetCode(""); setArchetypeSel("");
    setAttributes([]); setIcons([]); setMonsterTypes([]); setCardTypes([]);
    setLevelVal(undefined); setRankVal(undefined); setScaleVal(undefined); setLinkVal(undefined);
    setArrows([]); setAtkMin(undefined); setAtkMax(undefined); setDefMin(undefined); setDefMax(undefined);
    setLegal([]); setDateStart(""); setDateEnd("");
  };

  return (
    <div className="mb-4 rounded-2xl bg-neutral-950 border border-neutral-800 p-3 md:p-4">
      {/* Header row: Search + Set + Archetype + Actions */}
      <form
        className="grid gap-2 md:grid-cols-[1fr,12rem,12rem,auto] md:items-center"
        onSubmit={(e) => { e.preventDefault(); apply(); }}
      >
        <input
          placeholder="Search keyword/name/text…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm"
        />
        <select
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-sm min-w-[10rem]"
          value={setCode}
          onChange={(e) => setSetCode(e.target.value)}
        >
          <option value="">All Sets</option>
          {setsOptions.map((s: any) => (
            <option key={s.code} value={s.code}>{s.code}</option>
          ))}
        </select>
        <select
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-2 text-sm min-w-[10rem]"
          value={archetypeSel}
          onChange={(e) => setArchetypeSel(e.target.value)}
        >
          <option value="">All Archetypes</option>
          {archetypeOptions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        <div className="flex gap-2 md:justify-end">
          <button
            type="button"
            className="btn"
            onClick={() => {
              const n = !collapsed;
              setCollapsed(n);
              params.set("filters", n ? "0" : "1");
              setParams(params, { replace: true });
            }}
          >
            {collapsed ? "Show Filters" : "Hide Filters"}
          </button>
          <button type="button" className="btn" onClick={reset}>Reset</button>
          <button type="submit" className="btn btn-primary">Apply</button>
        </div>
      </form>

      {!collapsed && (
        <div className="mt-4 grid gap-3 md:gap-4 md:grid-cols-2">
          {/* Row 1: Attribute | Icon */}
          <Section
            title="Attribute"
            onClear={attributes.length ? () => setAttributes([]) : undefined}
          >
            <div className="flex flex-wrap gap-1.5">
              {ATTRS.map((a) => (
                <Chip key={a} active={attributes.includes(a)} onClick={() => toggle(attributes, setAttributes, a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </Section>

          <Section
            title="Icon"
            onClear={icons.length ? () => setIcons([]) : undefined}
          >
            <div className="flex flex-wrap gap-1.5">
              {ICONS.map((i) => (
                <Chip key={i} active={icons.includes(i)} onClick={() => toggle(icons, setIcons, i)}>
                  {i}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Row 2: Monster Type | Card Type */}
          <Section
            title="Monster Type"
            onClear={monsterTypes.length ? () => setMonsterTypes([]) : undefined}
            fixedHeight
          >
            <div className="flex flex-wrap gap-1.5">
              {monsterTypeOptions.map((t) => (
                <Chip
                  key={t}
                  active={monsterTypes.includes(String(t))}
                  onClick={() => toggle(monsterTypes, setMonsterTypes, String(t))}
                >
                  {t}
                </Chip>
              ))}
            </div>
          </Section>

          <Section
            title="Card Type"
            onClear={cardTypes.length ? () => setCardTypes([]) : undefined}
            fixedHeight
          >
            <div className="flex flex-wrap gap-1.5">
              {CARD_TYPES.map((t) => (
                <Chip key={t} active={cardTypes.includes(t)} onClick={() => toggle(cardTypes, setCardTypes, t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Row 3: Level | Rank */}
          <Section title="Level">
            <div className="flex flex-wrap gap-1">
              {LEVELS.map((n) => (
                <Chip key={`L${n}`} active={levelVal === n} onClick={() => toggleSingle(levelVal, setLevelVal, n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Rank">
            <div className="flex flex-wrap gap-1">
              {LEVELS.map((n) => (
                <Chip key={`R${n}`} active={rankVal === n} onClick={() => toggleSingle(rankVal, setRankVal, n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Row 4: Pendulum | Link Rating */}
          <Section title="Pendulum">
            <div className="flex flex-wrap gap-1">
              {SCALES.map((n) => (
                <Chip key={`S${n}`} active={scaleVal === n} onClick={() => toggleSingle(scaleVal, setScaleVal, n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </Section>

          <Section title="Link Rating">
            <div className="flex flex-wrap gap-1">
              {LINK_RATINGS.map((n) => (
                <Chip key={`LR${n}`} active={linkVal === n} onClick={() => toggleSingle(linkVal, setLinkVal, n)}>
                  {n}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Row 5: Link Arrows | Legality */}
          <Section
            title="Link Arrows"
            onClear={arrows.length ? () => setArrows([]) : undefined}
          >
            <div className="grid grid-cols-3 gap-1 w-[180px]">
              {ARROWS_GRID.map((a, i) =>
                a ? (
                  <Chip
                    key={a}
                    active={arrows.includes(a)}
                    onClick={() => toggle(arrows, setArrows, a)}
                    title={a}
                  >
                    {a}
                  </Chip>
                ) : (
                  <div
                    key={`blank-${i}`}
                    aria-hidden
                    className="px-3 py-1.5 rounded-md border border-neutral-800 bg-neutral-900 opacity-50 select-none"
                  />
                )
              )}
            </div>
          </Section>

          <Section
            title="Legality"
            onClear={legal.length ? () => setLegal([]) : undefined}
          >
            <div className="flex flex-wrap gap-1.5">
              {["Banned", "Limited", "Semi-Limited", "Legal"].map((v) => (
                <Chip key={v} active={legal.includes(v)} onClick={() => toggle(legal, setLegal, v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </Section>

          {/* Row 6: ATK/DEF | Dates */}
          <Section title="ATK / DEF">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-neutral-300">ATK</label>
              <input
                type="number"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm w-24"
                placeholder="min"
                value={atkMin ?? ""}
                onChange={(e) => setAtkMin(e.target.value ? Number(e.target.value) : undefined)}
              />
              <span className="text-neutral-500">–</span>
              <input
                type="number"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm w-24"
                placeholder="max"
                value={atkMax ?? ""}
                onChange={(e) => setAtkMax(e.target.value ? Number(e.target.value) : undefined)}
              />

              <label className="ml-3 text-xs text-neutral-300">DEF</label>
              <input
                type="number"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm w-24"
                placeholder="min"
                value={defMin ?? ""}
                onChange={(e) => setDefMin(e.target.value ? Number(e.target.value) : undefined)}
              />
              <span className="text-neutral-500">–</span>
              <input
                type="number"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm w-24"
                placeholder="max"
                value={defMax ?? ""}
                onChange={(e) => setDefMax(e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </Section>

          <Section title="Initial Release Date">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs text-neutral-300">Start</label>
              <input
                type="date"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
              />
              <label className="ml-2 text-xs text-neutral-300">End</label>
              <input
                type="date"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-sm"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
              />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
