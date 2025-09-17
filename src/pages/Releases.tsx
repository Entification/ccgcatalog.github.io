import { Link } from "react-router-dom";
import sets from "../data/sets.json";
import { asset } from "../utils/assets";

export default function Releases() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sets.map((s) => {
        const to = `/cards?set=${encodeURIComponent(s.code)}`;
        const cover = asset(s.coverImage || ""); // base-safe in dev & Pages
        return (
          <Link
            key={s.code}
            to={to}
            className="card group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-transform duration-150 will-change-transform hover:scale-[1.03] active:scale-[0.99]"
            title={`Open ${s.code} ${s.name}`}
          >
            <div className="w-full aspect-[818/1288] overflow-hidden rounded-xl mb-3 bg-neutral-900">
              <img
                src={cover}
                alt={`${s.name} cover`}
                className="w-full h-full object-cover object-center transition-transform duration-200 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <div className="font-semibold text-lg">
              {s.code} {s.name}
            </div>
            {s.releaseDate && (
              <div className="text-sm text-neutral-400">{s.releaseDate}</div>
            )}
            {s.description && (
              <p className="text-sm mt-2 text-neutral-200">{s.description}</p>
            )}

            <span className="btn btn-primary mt-3 inline-block" aria-hidden="true">
              View Set
            </span>
          </Link>
        );
      })}
    </div>
  );
}
