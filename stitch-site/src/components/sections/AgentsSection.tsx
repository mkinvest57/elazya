"use client"

import { motion } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

export function AgentsSection() {
  const agents = [
    {
      emoji: "📂",
      name: "Le Démêleur Finder",
      desc: "Réorganise 10 ans de dossiers chaotiques en triant chaque fichier par son vrai contenu sémantique, lu en local.",
      savings: "2h/semaine",
      color: "from-green-50 to-green-50/10",
      borderColor: "hover:border-green-200",
      iconBg: "bg-green-100",
    },
    {
      emoji: "🌐",
      name: "Le Pilote Safari",
      desc: "Pilote le navigateur visuellement pour gérer des extranets archaïques où aucune intégration Zapier n'est possible.",
      savings: "1h/client",
      color: "from-blue-50 to-blue-50/10",
      borderColor: "hover:border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      emoji: "✉️",
      name: "L'Erudit Apple Mail",
      desc: "Lit les longs fils de discussion dans Apple Mail et croise avec votre disque dur pour le brouillon parfait.",
      savings: "3h30/semaine",
      color: "from-sky-50 to-sky-50/10",
      borderColor: "hover:border-sky-200",
      iconBg: "bg-sky-100",
    },
  ]

  return (
    <section className="py-28 relative overflow-hidden border-b border-slate-200/50 z-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-5">
              <span className="text-slate-800">Des agents IA qui</span>
              {' '}
              <span className="text-gradient-primary">contrôlent vos apps natives</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
              Elazya agit directement dans Apple Mail, Finder, Calendrier et vos autres applications pour exécuter vos tâches avec 10 agents spécialisés.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {agents.map((agent, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative p-6 md:p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ${agent.borderColor} transition-all duration-300 group hover:-translate-y-1`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${agent.color} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${agent.iconBg} flex items-center justify-center mb-5 text-2xl shadow-sm border border-white/50`}>
                  {agent.emoji}
                </div>
                <h3 className="text-lg font-bold mb-3 text-slate-800">{agent.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-5 font-medium">{agent.desc}</p>
                <div className="flex items-center gap-2 text-sm bg-white/50 px-3 py-1.5 rounded-full w-max border border-slate-200/50">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-primary font-bold">{agent.savings} sauvées</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/agents">
            <motion.span
              whileHover={{ x: 5 }}
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4"
            >
              Voir les 7 autres agents
              <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </section>
  )
}
