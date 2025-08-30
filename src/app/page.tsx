import CategoriesGrid from "@/components/CategoriesGrid";
import { Lock, Network, Coins, Code2, Users, Compass } from "lucide-react";

const categories = [
  {
    title: "Cryptography",
    descr: "Keys, signatures, proof-of-work, hash functions.",
    iconNode: <Lock className="h-6 w-6" />,
  },
  {
    title: "Distributed Systems",
    descr: "Consensus, networking, nodes, latency, fault tolerance.",
    iconNode: <Network className="h-6 w-6" />,
  },
  {
    title: "Economics & Game Theory",
    descr: "Incentives, auctions, equilibria, fee markets.",
    iconNode: <Coins className="h-6 w-6" />,
  },
  {
    title: "Software Engineering",
    descr: "Design, testing, security, release discipline.",
    iconNode: <Code2 className="h-6 w-6" />,
  },
  {
    title: "Community & Communication",
    descr: "Docs, collaboration, leadership in public.",
    iconNode: <Users className="h-6 w-6" />,
  },
  {
    title: "Vision & Product Sense",
    descr: "Problem framing, UX, long-term thinking.",
    iconNode: <Compass className="h-6 w-6" />,
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

        <CategoriesGrid categories={categories} />
      </div>
    </main>
  );
}