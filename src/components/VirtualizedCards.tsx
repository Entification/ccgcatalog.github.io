import { FixedSizeGrid as Grid } from 'react-window'
import { useEffect, useRef, useState } from 'react'
import CardTile from './CardTile'
import type { Card } from '../types/card'

export default function VirtualizedCards({ items }: { items: Card[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1200)

  useEffect(() => {
    const onResize = () => setWidth(containerRef.current?.clientWidth || 1200)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // spacing + sizing
  const gap = 16                    // equal spacing between tiles (x & y)
  const cardPadding = 16            // .card has p-4
  const colWidth = 240              // content width of one tile (image box width)

  const aspect = 1.45965417867      // YGO card height/width
  const imageHeight = Math.round(colWidth * aspect)

  // total tile content height (image only grid view)
  const tileWidth = colWidth
  const tileHeight = imageHeight + cardPadding * 2

  // grid cell includes the gap, so neighbors are exactly 'gap' apart
  const cellWidth = tileWidth + gap
  const cellHeight = tileHeight + gap

  const cols = Math.max(1, Math.floor((width + gap) / (colWidth + gap)))
  const rows = Math.ceil(items.length / cols)

  return (
    <div ref={containerRef} className="w-full cards-grid">
      <Grid
        columnCount={cols}
        columnWidth={cellWidth}
        height={800}
        rowCount={rows}
        rowHeight={cellHeight}
        width={width}
        style={{ overflowX: 'hidden' }}
      >
        {({ columnIndex, rowIndex, style }) => {
          const index = rowIndex * cols + columnIndex
          const card = items[index]
          if (!card) return <div style={style} />

          // padding = gap/2 so adjacent cells form exactly 'gap'
          return (
            <div style={{ ...style, padding: gap / 2, boxSizing: 'border-box' }}>
              <div style={{ width: tileWidth, height: tileHeight }}>
                <CardTile card={card} imageHeight={imageHeight} />
              </div>
            </div>
          )
        }}
      </Grid>
    </div>
  )
}
