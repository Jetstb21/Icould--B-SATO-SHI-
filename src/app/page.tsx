import { Brain, Shield, Code, Database, Network, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">
            Could I Be <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Sato-Shi</span>?
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A comprehensive readiness profile that measures your skills against the 2008 benchmark 
            while valuing all eras of knowledge. Test your abilities and see where you stand.
          </p>
        </div>

        {/* Skill Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {[
            { icon: Brain, title: "Cryptography", desc: "Hash functions, digital signatures, proof systems" },
            { icon: Code, title: "Programming", desc: "C++, Python, system-level development" },
            { icon: Network, title: "Networking", desc: "P2P protocols, distributed systems" },
            { icon: Database, title: "Data Structures", desc: "Merkle trees, blockchain architecture" },
            { icon: Shield, title: "Security", desc: "Cryptographic protocols, attack vectors" },
            { icon: Zap, title: "Innovation", desc: "Problem-solving, breakthrough thinking" }
          ].map((category, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
              <category.icon className="w-12 h-12 text-orange-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">{category.title}</h3>
              <p className="text-slate-300">{category.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Test Your Skills?</h2>
            <p className="text-slate-300 mb-6">
              Build your personalized readiness profile and discover if you have what it takes.
              Elite status awaits those who achieve 3+ in all categories.
            </p>
            <button className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}