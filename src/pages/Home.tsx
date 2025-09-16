import news from '../data/news.json'

export default function Home(){
  return (
    <div className="grid gap-6">
      <section className="card">
        <h1 className="text-2xl font-semibold mb-2">Welcome to the Custom Card Game Yugioh Community</h1>
        <p className="text-neutral-300">This directory explains the premise of the CCG community, showcases latest news, and links to releases and the database. Use the tabs above to explore.</p>
      </section>
      <section className="card">
        <h2 className="text-xl font-semibold mb-3">Latest News</h2>
        <ul className="space-y-2">
          {news.map((n,i)=> (
            <li key={i} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-xs text-neutral-400">{n.date}</div>
              </div>
              <a href={n.link} className="btn">View</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
