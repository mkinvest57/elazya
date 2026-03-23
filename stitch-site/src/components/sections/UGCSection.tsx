"use client"

import { motion } from "framer-motion"
import { Play } from "lucide-react"

const videos = [
    { name: "Thomas L.", role: "Consultant SEO", duration: "1:24" },
    { name: "Sarah M.", role: "Fondatrice d'Agence", duration: "2:01" },
    { name: "Marc D.", role: "Développeur Freelance", duration: "1:47" },
]

export function UGCSection() {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.12 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
    }

    return (
        <section className="max-w-[1100px] mx-auto py-16 md:py-20 px-4">
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center text-sm font-geist font-medium text-gray-400 uppercase tracking-widest mb-10"
            >
                Ce qu'en disent nos clients
            </motion.p>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {videos.map((v, i) => (
                    <motion.div
                        key={i}
                        variants={item}
                        className="group relative aspect-[9/14] md:aspect-[9/16] bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 rounded-[20px] overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
                    >
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <Play className="w-6 h-6 text-[#0f172a] ml-1" fill="#0f172a" />
                            </div>
                        </div>

                        {/* Duration badge */}
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs font-geist font-medium px-2.5 py-1 rounded-full z-10">
                            {v.duration}
                        </div>

                        {/* Bottom info */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 z-10">
                            <p className="text-white font-geist font-bold text-sm">{v.name}</p>
                            <p className="text-white/70 font-geist text-xs">{v.role}</p>
                        </div>

                        {/* Placeholder content */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-gray-50 to-indigo-50 flex items-center justify-center">
                            <span className="text-6xl opacity-20">🎬</span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center mt-8"
            >
                <a href="#avis" className="text-sm font-geist font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    Voir tous les avis sur Google →
                </a>
            </motion.div>
        </section>
    )
}
