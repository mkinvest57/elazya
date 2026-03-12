"use client"

import { motion } from "framer-motion"

export function Footer() {
    const scrollToPricing = () => {
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <footer className="relative bg-gradient-to-b from-[#f8fbff] to-white pt-24 pb-12 overflow-hidden border-t border-slate-200/50">
            {/* Soft background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold text-slate-800 mb-8 tracking-tight"
                    >
                        Prêt à récupérer 12h par semaine ?
                    </motion.h2>
                    <motion.button 
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                        whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                        onClick={scrollToPricing}
                        className="bg-[#0f172a] hover:bg-slate-800 text-white text-lg md:text-xl font-bold px-10 py-5 rounded-full shadow-[0_12px_24px_rgb(15,23,42,0.25)] transition-all ring-1 ring-slate-800/10"
                    >
                        Obtenir mon équipe IA
                    </motion.button>
                </div>

                {/* Bottom line */}
                <div className="border-t border-slate-200/80 pt-8 mt-16 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-200 shadow-inner flex items-center justify-center">
                            <img src="/logo.png" alt="" className="w-4 h-4 rounded-sm" />
                        </div>
                        © 2026 Elazya. Tous droits réservés.
                    </div>
                    <div>100% Native on Apple Silicon</div>
                </div>
            </div>
        </footer>
    )
}
