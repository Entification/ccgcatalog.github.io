import { FixedSizeList as List, type ListChildComponentProps } from 'react-window'
import { useEffect, useRef, useState } from 'react'
import type { Card } from '../types/card'
import CardRow from './CardRow'

export default function VirtualizedCardList({ items }: { items: Card[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1200)

  useEffect(() => {
    const onResize = () => setWidth(containerRef.current?.clientWidth || 1200)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const rowHeight = 176
  const rowGap = 12

  const Row = ({ index, style }: ListChildComponentProps) => {
    const card = items[index]
    return (
      <div style={{ ...style, top: (style as any).top + rowGap / 2, height: rowHeight - rowGap }}>
        <CardRow card={card} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full">
      <List height={800} itemCount={items.length} itemSize={rowHeight} width={width}>
        {Row}
      </List>
    </div>
  )
}
