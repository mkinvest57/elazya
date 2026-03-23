"use client"

import { motion } from "framer-motion"
import { Calendar, ArrowRight } from "lucide-react"

export function BookingSection() {
    return (
        <section id="booking" className="max-w-[1100px] mx-auto py-20 md:py-28 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 80, damping: 20 }}
                className="bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-gray-200 rounded-[28px] p-8 md:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.04)]"
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                    {/* Left — Form */}
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 shadow-sm mb-6">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-geist font-bold text-[#0f172a] uppercase tracking-wider">
                                Appel Gratuit — 30 min
                            </span>
                        </div>

                        <h2 className="text-[26px] md:text-[34px] font-geist font-bold text-[#0f172a] leading-tight mb-4">
                            Réservez votre appel{" "}
                            <span className="font-instrument italic text-blue-600 font-normal">stratégique.</span>
                        </h2>

                        <p className="text-[15px] font-geist text-[#373a46] opacity-70 leading-relaxed mb-8 max-w-md">
                            En 30 minutes, on analyse votre workflow actuel et on vous montre exactement comment Elazya peut vous faire gagner 12h par semaine.
                        </p>

                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div>
                                <input
                                    type="text"
                                    placeholder="Prénom"
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl font-geist text-sm text-[#0f172a] placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="Email professionnel"
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl font-geist text-sm text-[#0f172a] placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    placeholder="Téléphone (optionnel)"
                                    className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-xl font-geist text-sm text-[#0f172a] placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-full font-geist font-semibold text-white bg-gradient-to-b from-gray-800 to-[#0f172a] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:scale-[1.01] transition-all duration-300 text-sm"
                            >
                                Réserver mon créneau
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>

                        <p className="text-xs font-geist text-gray-400 mt-4">
                            🔒 Vos données ne sont jamais partagées. Pas de spam.
                        </p>
                    </div>

                    {/* Right — Calendar placeholder */}
                    <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm min-h-[400px] flex flex-col">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <span className="font-geist font-bold text-sm text-[#0f172a]">Mars 2026</span>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-sm">←</button>
                                <button className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-sm">→</button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 grid grid-cols-7 gap-2 text-center">
                            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                                <span key={day} className="text-xs font-geist font-bold text-gray-400 py-1">{day}</span>
                            ))}
                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                <button
                                    key={day}
                                    className={`w-full aspect-square rounded-lg text-sm font-geist font-medium transition-all duration-200 ${[5, 6, 7, 12, 13, 14, 19, 20, 21, 26, 27, 28].includes(day)
                                            ? "text-[#0f172a] hover:bg-blue-50 hover:text-blue-600 cursor-pointer"
                                            : "text-gray-300 cursor-default"
                                        } ${day === 19 ? "bg-blue-600 text-white hover:bg-blue-700 hover:text-white" : ""}`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    )
}
