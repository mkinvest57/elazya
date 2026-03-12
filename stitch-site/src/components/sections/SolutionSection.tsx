"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

export function SolutionSection() {
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
    <section className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center py-24 px-4 overflow-hidden">
      
      {/* Côté Gauche */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="flex flex-col space-y-8"
      >
        <motion.h2 variants={item} className="text-[32px] md:text-[40px] font-geist font-medium text-[#0f172a] leading-tight">
          L'IA qui exécute vraiment.
        </motion.h2>
        
        <ul className="space-y-6">
          {[
            "Pilotable par note vocale sur Telegram", 
            "100% Local sur votre disque dur", 
            "Travaille 24/7 en tâche de fond"
          ].map((text, i) => (
            <motion.li key={i} variants={item} className="flex items-center gap-4">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100/50 border border-emerald-200 shrink-0">
                <Check className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-lg font-geist text-[#373a46] font-medium">{text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
      
      {/* Côté Droit */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
        className="w-full"
      >
        <div className="aspect-video bg-gray-100 border border-gray-200 rounded-[24px] shadow-xl flex items-center justify-center overflow-hidden">
          <span className="font-mono text-sm text-gray-500 font-medium px-4 text-center">Placeholder Iframe Arcade.software</span>
        </div>
      </motion.div>
      
    </section>
  )
}
