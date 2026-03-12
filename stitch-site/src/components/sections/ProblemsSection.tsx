"use client"

import { motion } from "framer-motion"

export function ProblemsSection() {
  const problems = [
    {
      title: "Soirées perdues",
      desc: "Vos nuits passent dans la rédaction de devis et le tri de mails au lieu de développer votre boîte."
    },
    {
      title: "La peur du Cloud",
      desc: "Vous refusez de donner vos factures et données clients sensibles à des intelligences artificielles en ligne."
    },
    {
      title: "Complexité technique",
      desc: "Vous savez que l'IA peut vous aider, mais vous n'avez ni le temps ni l'envie de coder des scripts complexes."
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  }

  return (
    <section className="max-w-[1200px] mx-auto py-24 md:py-32 px-4 text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="text-[32px] md:text-[40px] font-geist font-medium text-[#0f172a] max-w-3xl mx-auto leading-tight"
      >
        Vous êtes le goulot d'étranglement de votre propre business.
      </motion.h2>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
      >
        {problems.map((prob, i) => (
          <motion.div
            key={i}
            variants={item}
            className="bg-[#fcfcfc] border border-gray-200 rounded-[24px] p-8 text-left hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <h3 className="text-xl font-bold font-geist text-[#0f172a] mb-3">{prob.title}</h3>
            <p className="text-base text-[#373a46] opacity-80 leading-relaxed font-geist font-medium">
              {prob.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
