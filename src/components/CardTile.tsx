import type { Card } from '../types/card'
import { useImageViewer } from './ImageViewer'

type Props = { card: Card; imageHeight?: number }

export default function CardTile({ card, imageHeight }: Props) {
  const { open } = useImageViewer()
  return (
    <div className="card">
      <div
        className="w-full rounded-xl overflow-hidden cursor-zoom-in"
        style={imageHeight ? { height: imageHeight } : { aspectRatio: '1 / 1.45965417867' }}
        onClick={() => open(card.image, card.name)}
        title="Click to enlarge"
      >
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-contain object-center"
          loading="lazy"
        />
      </div>
    </div>
  )
}
