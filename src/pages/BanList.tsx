import useBanlistCards from "../hooks/useBanlistCards";
import CardTile from "../components/CardTile";

function Section({ title, items }:{ title:string, items:any[] }){
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-3">
        {title} <span className="text-sm text-neutral-400">({items.length})</span>
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(c => <CardTile key={c.id} card={c}/>)}
      </div>
    </section>
  );
}

export default function BanList(){
  const { cards, loading, error } = useBanlistCards();
  if (loading) return <div>Loading…</div>;
  if (error) return <div className="text-red-500">Failed to load ban list.</div>;

  const banned   = cards.filter(c => c.legal?.banned);
  const limited  = cards.filter(c => c.legal?.limited && !c.legal?.banned);
  const semi     = cards.filter(c => c.legal?.semiLimited && !c.legal?.limited && !c.legal?.banned);

  return (
    <div className="grid gap-6">
      <Section title="Banned" items={banned} />
      <Section title="Limited" items={limited} />
      <Section title="Semi-Limited" items={semi} />
    </div>
  );
}

