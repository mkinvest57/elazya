"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

export function FinalCTASection() {
  return (
    <section className="px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 80, damping: 20 }}
        className="max-w-[1100px] mx-auto relative rounded-[28px] overflow-hidden"
      >
        {/* Animated gradient background — Magic UI inspired */}
        <div className="absolute inset-0 bg-[#0f172a]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/20 to-transparent rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4 animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-600/15 to-transparent rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 animate-[float_10s_ease-in-out_infinite_3s]" />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-[60px] -translate-x-1/2 -translate-y-1/2 animate-[float_12s_ease-in-out_infinite_5s]" />
        </div>

        <div className="relative z-10 px-8 py-16 md:px-16 md:py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-geist font-bold text-blue-300 uppercase tracking-wider">
                Offre limitée
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[28px] md:text-[48px] font-geist font-bold text-white leading-tight max-w-[700px] mx-auto"
          >
            Ne laissez pas vos concurrents{" "}
            <span className="font-instrument italic text-blue-400 font-normal">prendre l'avance.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base md:text-lg font-geist text-white/50 max-w-[550px] mx-auto leading-relaxed"
          >
            +60 entreprises utilisent déjà Elazya pour automatiser ce que vous faites encore à la main. Garantie 14 jours, risque zéro.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10"
          >
            {/* Shimmer CTA — Magic UI animated border */}
            <a
              href="#booking"
              className="group relative inline-flex items-center gap-2 px-10 py-5 rounded-full font-geist font-semibold text-sm overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-violet-400 to-indigo-400 rounded-full" />
              <span className="absolute inset-[1.5px] bg-white rounded-full" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/80 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2 text-[#0f172a]">
                Planifier un Appel Gratuit
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
