"use client"

import { motion } from "framer-motion"
import { Clock, CloudOff, Code } from "lucide-react"

export function ProblemsSection() {
  const problems = [
    {
      icon: <Clock className="w-6 h-6 text-blue-500" />,
      title: "Soirées perdues",
      desc: "Vous passez vos nuits à rédiger des devis et trier des mails au lieu de développer votre boîte.",
      color: "bg-blue-50 border-blue-100"
    },
    {
      icon: <CloudOff className="w-6 h-6 text-red-500" />,
      title: "La peur du Cloud",
      desc: "Vous refusez de donner vos factures et données clients sensibles à des IA en ligne.",
      color: "bg-red-50 border-red-100"
    },
    {
      icon: <Code className="w-6 h-6 text-emerald-500" />,
      title: "Complexité technique",
      desc: "Vous savez que l'IA peut vous aider, mais vous n'avez pas le temps de coder des scripts complexes.",
      color: "bg-emerald-50 border-emerald-100"
    }
  ]

  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative z-10 border-b border-slate-200/50">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight leading-[1.1] max-w-3xl mx-auto"
        >
          Vous êtes le goulot d'étranglement de votre propre business.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {problems.map((prob, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-transform"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${prob.color}`}>
              {prob.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{prob.title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">
              {prob.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
