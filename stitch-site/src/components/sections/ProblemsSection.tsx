"use client"

import { motion } from "framer-motion"
import { AlertTriangle, Clock, EyeOff, ArrowRight } from "lucide-react"

const problems = [
  {
    icon: Clock,
    title: "Vous perdez 12h par semaine sur des tâches répétitives",
    desc: "Relances, devis, mails de suivi, mise à jour CRM... Des heures perdues chaque jour sur des actions qu'un agent IA peut exécuter en 30 secondes.",
    color: "text-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-100",
  },
  {
    icon: AlertTriangle,
    title: "Vos leads refroidissent pendant que vous bossez",
    desc: "Un prospect attend plus de 3h ? 78% de chance qu'il signe ailleurs. Sans automatisation, vos meilleurs leads filent chez vos concurrents.",
    color: "text-red-500",
    bg: "bg-red-50",
    border: "border-red-100",
  },
  {
    icon: EyeOff,
    title: "Vous n'osez pas confier vos données au cloud",
    desc: "Les solutions SaaS envoient vos données sur leurs serveurs. Vos emails clients, vos devis, vos contacts — tout est exposé. Vous méritez mieux.",
    color: "text-violet-500",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
]

export function ProblemsSection() {
  return (
    <section className="max-w-[1100px] mx-auto py-20 md:py-28 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-[28px] md:text-[40px] font-geist font-bold text-[#0f172a] leading-tight">
          Sans automatisation, vous{" "}
          <span className="font-instrument italic text-red-500 font-normal">perdez la course.</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {problems.map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100, damping: 20 }}
              className={`group relative ${p.bg} ${p.border} border rounded-[20px] p-7 md:p-8 cursor-default hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-11 h-11 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <h3 className="text-lg font-geist font-bold text-[#0f172a] mb-3 leading-snug">
                {p.title}
              </h3>
              <p className="text-sm font-geist text-[#373a46] opacity-70 leading-relaxed">
                {p.desc}
              </p>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 text-center"
      >
        <a
          href="#benefits"
          className="inline-flex items-center gap-2 text-sm font-geist font-semibold text-[#0f172a] hover:text-blue-600 transition-colors group cursor-pointer"
        >
          Voir comment Elazya résout ça
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </a>
      </motion.div>
    </section>
  )
}
