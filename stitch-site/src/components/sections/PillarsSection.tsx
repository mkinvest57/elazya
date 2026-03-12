"use client"

import { motion } from "framer-motion"

export function PillarsSection() {
  const pillars = [
    {
      emoji: "🔒",
      title: "100% Local & Privé",
      desc: "Vos données (factures, emails) restent sur votre disque dur. Rien ne part sur le Cloud."
    },
    {
      emoji: "💳",
      title: "Achat Définitif",
      desc: "Fini les abonnements SaaS toxiques à 100€/mois. Vous achetez le logiciel une seule fois."
    },
    {
      emoji: "⚡",
      title: "Zéro Technique",
      desc: "Installation en 1 clic. Aucune ligne de commande. Interface Mac native."
    }
  ]

  return (
    <section className="py-24 max-w-5xl mx-auto px-6 relative z-10 border-b border-slate-200/50">
      <div className="grid md:grid-cols-3 gap-8 text-center">
        {pillars.map((pillar, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/60 backdrop-blur-md border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
          >
            <div className="text-4xl mb-5">{pillar.emoji}</div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{pillar.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-medium">
              {pillar.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
