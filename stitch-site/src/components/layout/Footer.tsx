"use client"

import { motion } from "framer-motion"

export function Footer() {
    return (
        <footer className="border-t border-gray-200 mt-24 py-20 text-center bg-[#fcfcfc]">
            <div className="max-w-[800px] mx-auto px-4">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="text-[32px] md:text-[40px] font-geist font-medium text-[#0f172a] mb-10 leading-tight"
                >
                    Prêt à récupérer 12h par semaine ?
                </motion.h2>

                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
                    className="px-8 py-4 rounded-full font-geist font-medium text-white bg-gradient-to-b from-gray-800 to-black shadow-[inset_-4px_-6px_25px_0px_rgba(201,201,201,0.08),inset_4px_4px_10px_0px_rgba(29,29,29,0.24)] hover:scale-105 transition-all duration-300"
                >
                    Obtenir mon équipe IA
                </motion.button>
            </div>
            <div className="text-sm text-gray-500 font-geist mt-20">
                © 2026 Elazya. 100% Native on Apple Silicon.
            </div>
        </footer>
    )
}
