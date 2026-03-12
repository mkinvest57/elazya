"use client"

import { motion } from "framer-motion"
import { Check, MonitorPlay } from "lucide-react"

export function SolutionSection() {
  return (
    <section className="py-24 max-w-6xl mx-auto px-6 relative z-10 border-b border-slate-200/50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid md:grid-cols-2 gap-12 items-center bg-[#0a0f1d] rounded-[2.5rem] p-8 md:p-14 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 -translate-y-1/2 -translate-x-1/2 bg-primary/20 blur-[100px] pointer-events-none" />
        
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight leading-tight">
            L'IA qui ne fait pas que discuter. Elle exécute.
          </h2>
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-full shrink-0 border border-emerald-500/30">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg text-slate-300 font-medium">Pilotable par notes vocales sur WhatsApp ou Telegram.</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-full shrink-0 border border-emerald-500/30">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg text-slate-300 font-medium">Interagit vraiment avec vos applications Mac natives.</span>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-emerald-500/20 p-1.5 rounded-full shrink-0 border border-emerald-500/30">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-lg text-slate-300 font-medium">Travaille en tâche de fond 24/7 (Morning brief, alertes).</span>
            </li>
          </ul>
        </div>
        
        <div className="relative z-10">
          <div className="aspect-video bg-[#0f1523] rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center text-slate-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden group">
            <MonitorPlay className="w-12 h-12 mb-4 text-slate-600 group-hover:text-primary transition-colors duration-500" />
            <span className="font-mono text-xs tracking-wider">Placeholder Iframe Arcade.software</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
