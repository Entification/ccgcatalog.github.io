import type { Card } from "../types/card";
import { useImageViewer } from "./ImageViewer";
import { asset } from "../utils/assets";

type Props = { card: Card; imageHeight?: number };

export default function CardTile({ card, imageHeight }: Props) {
  const { open } = useImageViewer();
  const imgSrc = asset(card.image); // handles relative & absolute

  return (
    <div className="card">
      <div
        className="w-full rounded-xl overflow-hidden cursor-zoom-in bg-neutral-900"
        style={imageHeight ? { height: imageHeight } : { aspectRatio: "1 / 1.45965417867" }}
        onClick={() => open(imgSrc, card.name)}
        title="Click to enlarge"
      >
        <img
          src={imgSrc}
          alt={card.name}
          className="w-full h-full object-contain object-center"
          loading="lazy"
        />
      </div>
    </div>
  );
}
