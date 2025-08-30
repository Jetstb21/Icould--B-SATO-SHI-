import CategoryCard from "@/components/CategoryCard";
import {
  Lock, Network, Coins, Code2, Users, Compass
} from "lucide-react";

const categories = [
  {
    title: "Cryptography",
    descr: "Keys, signatures, PoW/PoS, hash functions.",
    Icon: Lock,
  },
  {
    title: "Distributed Systems",
    descr: "Consensus, networking, nodes, latency/faults.",
    Icon: Network,
  },
  {
    title: "Economics & Game Theory",
    descr: "Incentives, auctions, equilibria, fee markets.",
    Icon: Coins,
  },
  {
    title: "Software Engineering",
    descr: "Design, testing, security, release discipline.",
    Icon: Code2,
  },
  {
    title: "Community & Communication",
    descr: "Docs, collaboration, leadership in public.",
    Icon: Users,
  },
  {
    title: "Vision & Product Sense",
    descr: "Problem framing, UX, long-term thinking.",
    Icon: Compass,
  },
];

export default function Page() {
  return (
    <main className="min-h-dvh bg-gradient-to-b from-slate-900 to-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Could I Be Sato-Shi?
          </h1>
          <p className="mt-3 text-white/70 max-w-2xl">
            Explore the six skill pillars that defined early Bitcoin builders.
            Rate yourself and track progress over time.
          </p>
        </header>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <CategoryCard key={c.title} {...c} />
          ))}
        </section>
      </div>
    </main>
  );
}