import {
  FixedSizeList as List,
  type ListChildComponentProps,
} from "react-window";
import { useMemo } from "react";
import type { Card } from "../types/card";
import CardRow from "./CardRow";
import { useMeasure } from "../hooks/useMeasure";

export default function VirtualizedCardList({ items }: { items: Card[] }) {
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();

  const rowHeight = 176;
  const rowGap = 12;

  const Row = useMemo(
    () =>
      ({ index, style }: ListChildComponentProps) => {
        const card = items[index];
        return (
          <div
            style={{
              ...style,
              top: (style as any).top + rowGap / 2,
              height: rowHeight - rowGap,
            }}
          >
            <CardRow card={card} />
          </div>
        );
      },
    [items]
  );

  const listHeight = Math.max(240, height || 800);
  const listWidth = Math.max(320, width || 1200);

  return (
    <div ref={containerRef} className="w-full h-full">
      <List
        height={listHeight}
        itemCount={items.length}
        itemSize={rowHeight}
        width={listWidth}
      >
        {Row}
      </List>
    </div>
  );
}
