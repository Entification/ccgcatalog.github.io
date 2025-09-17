import type { Card } from "../types/card";
import clsx from "clsx";
import { useImageViewer } from "./ImageViewer";
import { asset } from "../utils/assets";

const RATIO = 1.45965417867;

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-neutral-700 px-2 py-0.5 text-[11px] leading-none text-neutral-300">
      {children}
    </span>
  );
}

export default function CardRow({ card }: { card: Card }) {
  const isMonster = card.category === "Monster";
  const imgW = 96;
  const imgH = Math.round(imgW * RATIO);
  const { open } = useImageViewer();

  const imgSrc = asset(card.image);

  return (
    <div className="list-row rounded-2xl bg-neutral-900 shadow-soft p-3 transition">
      <div className="grid grid-cols-[auto,1fr,auto] gap-3 items-start">
        {/* Left: image (click to enlarge) */}
        <button
          type="button"
          className="card-image rounded-xl cursor-zoom-in"
          style={{ width: imgW, height: imgH }}
          onClick={() => open(imgSrc, card.name)}
          title="Click to enlarge"
        >
          <img
            src={imgSrc}
            alt={card.name}
            className="w-full h-full object-contain rounded-xl"
            loading="lazy"
          />
        </button>

        {/* Middle: title + chips + text */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold tracking-wide uppercase text-sm truncate">
              {card.name}
            </h3>
            <div className="flex items-center gap-1 flex-wrap">
              {isMonster && card.attribute && <Chip>{card.attribute}</Chip>}
              {!isMonster && (card.icon || "Normal") && (
                <Chip>{card.icon || "Normal"}</Chip>
              )}
              {isMonster &&
                (card.level != null ||
                  card.rank != null ||
                  card.linkRating != null) && (
                  <Chip>
                    {card.level != null && <>Level {card.level}</>}
                    {card.rank != null && <>Rank {card.rank}</>}
                    {card.linkRating != null && <>Link {card.linkRating}</>}
                  </Chip>
                )}
              {isMonster && card.monsterType?.length ? (
                <Chip>{card.monsterType.join(" / ")}</Chip>
              ) : (
                <Chip>
                  {card.category}
                  {card.cardTypes?.length
                    ? ` • ${card.cardTypes.join(" / ")}`
                    : ""}
                </Chip>
              )}
              {card.scale != null && <Chip>Scale {card.scale}</Chip>}
            </div>
          </div>

          {card.text && (
            <p className="text-sm text-neutral-300 mt-1 line-clamp-3">
              {card.text}
            </p>
          )}

          <div className="text-[12px] text-neutral-400 mt-1">
            {card.archetype && <span>{card.archetype}</span>}
            {card.set && (
              <span
                className={clsx(
                  card.archetype && "before:content-['•'] before:mx-1",
                )}
              >
                {card.set}
              </span>
            )}
          </div>
        </div>

        {/* Right: quick stats / legality */}
        <div className="flex flex-col items-end gap-2 pl-2">
          {isMonster ? (
            <div className="text-xs text-neutral-200">
              <span className="inline-block min-w-[120px] text-right">
                ATK {card.atk ?? "-"} / DEF {card.def ?? "-"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-neutral-400">Spell/Trap</div>
          )}

          {card.legal?.banned && (
            <span className="text-[11px] rounded-md px-2 py-0.5 bg-red-700/30 text-red-300 border border-red-700/60">
              BANNED
            </span>
          )}
          {!card.legal?.banned && card.legal?.limited && (
            <span className="text-[11px] rounded-md px-2 py-0.5 bg-orange-700/30 text-orange-300 border border-orange-700/60">
              LIMITED
            </span>
          )}
          {!card.legal?.banned &&
            !card.legal?.limited &&
            card.legal?.semiLimited && (
              <span className="text-[11px] rounded-md px-2 py-0.5 bg-yellow-700/30 text-yellow-300 border border-yellow-700/60">
                SEMI
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
