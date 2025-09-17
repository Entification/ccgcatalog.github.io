import { Link } from "react-router-dom";
import news from "../data/news.json";

// tiny util: safe date -> "01 May 2025"
const fmt = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.valueOf()) ? iso : d.toLocaleDateString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// sort newest first (expects ISO "YYYY-MM-DD")
const sorted = [...news].sort((a, b) => String(b.date).localeCompare(String(a.date)));

export default function Home() {
  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-2">
          Welcome to the Custom Card Game Yugioh Community
        </h1>
        <p className="text-neutral-300">
          This directory explains the premise of the CCG community, showcases
          latest news, and links to releases and the database. Use the tabs
          above to explore.
        </p>
      </section>

      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Latest News</h2>
        <ul className="space-y-2">
          {sorted.map((n, i) => {
            const isExternal = /^https?:\/\//i.test(n.link);
            return (
              <li key={i} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-neutral-400">{fmt(n.date)}</div>
                </div>
                {isExternal ? (
                  <a href={n.link} className="btn" target="_blank" rel="noreferrer">
                    View
                  </a>
                ) : (
                  <Link to={n.link} className="btn">
                    View
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
