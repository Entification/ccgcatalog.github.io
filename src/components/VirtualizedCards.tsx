import { FixedSizeGrid as Grid } from "react-window";
import { useMemo } from "react";
import CardTile from "./CardTile";
import type { Card } from "../types/card";
import { useMeasure } from "../hooks/useMeasure";

export default function VirtualizedCards({ items }: { items: Card[] }) {
  const [containerRef, { width, height }] = useMeasure<HTMLDivElement>();

  // spacing + sizing
  const gap = 16;         // equal spacing between tiles (x & y)
  const cardPadding = 16; // .card has p-4
  const colWidth = 240;   // content width of one tile (image box width)
  const aspect = 1.45965417867; // YGO card height/width
  const imageHeight = Math.round(colWidth * aspect);

  const tileWidth = colWidth;
  const tileHeight = imageHeight + cardPadding * 2;
  const cellWidth = tileWidth + gap;
  const cellHeight = tileHeight + gap;

  const cols = Math.max(1, Math.floor((width + gap) / (colWidth + gap)));
  const rows = Math.ceil(items.length / cols);

  const gridHeight = Math.max(240, height || 800); // fallback if parent has no height
  const gridWidth = Math.max(320, width || 1200);

  const Cell = useMemo(
    () =>
      ({ columnIndex, rowIndex, style }: any) => {
        const index = rowIndex * cols + columnIndex;
        const card = items[index];
        if (!card) return <div style={style} />;
        return (
          <div style={{ ...style, padding: gap / 2, boxSizing: "border-box" }}>
            <div style={{ width: tileWidth, height: tileHeight }}>
              <CardTile card={card} imageHeight={imageHeight} />
            </div>
          </div>
        );
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, cols, gap, tileWidth, tileHeight, imageHeight]
  );

  return (
    <div ref={containerRef} className="w-full h-full cards-grid">
      <Grid
        columnCount={cols}
        columnWidth={cellWidth}
        height={gridHeight}
        rowCount={rows}
        rowHeight={cellHeight}
        width={gridWidth}
        style={{ overflowX: "hidden" }}
      >
        {Cell as any}
      </Grid>
    </div>
  );
}
