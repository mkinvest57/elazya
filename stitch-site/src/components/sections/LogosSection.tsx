"use client"

import { motion } from "framer-motion"

export function LogosSection() {
  const logos = ['AgencyPro', 'StudioTech', 'FreelanceX', 'Creativ', 'ScaleUp']

  return (
    <section className="py-16 border-y border-slate-200/50 bg-transparent relative z-10">
      <div className="container mx-auto px-6">
        <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">
          REJOINT PAR PLUS DE 500 FREELANCES ET AGENCES
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
          {logos.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 font-bold text-lg text-slate-400 hover:text-slate-600 transition-colors cursor-default grayscale hover:grayscale-0"
            >
                <div className="w-6 h-6 rounded bg-slate-200 shadow-inner border border-slate-300" /> 
                {name}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
