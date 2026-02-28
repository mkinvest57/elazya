"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { GlassBackground } from '@/components/ui/GlassBackground'

export function Hero() {
    const [isToggled, setIsToggled] = useState(true);

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-10 overflow-hidden bg-background">
            <GlassBackground />

            <div className="container relative z-10 px-6 mx-auto">
                <div className="max-w-5xl mx-auto text-center mt-[-10vh]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex flex-col items-center"
                    >
                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-[5.5rem] lg:text-[6.5rem] font-semibold tracking-tight mb-6 text-slate-800 leading-[1.1]">
                            L'assistant IA
                            <span className="inline-flex items-center mx-3 md:mx-4 align-middle translate-y-[-4px]">
                                <button 
                                    onClick={() => setIsToggled(!isToggled)}
                                    className="relative flex items-center w-16 h-8 sm:w-20 sm:h-10 md:w-28 md:h-14 rounded-full p-1.5 transition-colors duration-300 toggle-track-gradient shadow-inner"
                                    aria-label="Toggle capability"
                                >
                                    <motion.div 
                                        layout
                                        initial={false}
                                        animate={{ x: isToggled ? '100%' : '0%' }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-11 md:h-11 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                        style={{ marginLeft: isToggled ? '8px' : '4px' }}
                                    />
                                </button>
                            </span>
                            <br className="hidden md:block" />
                            <span className="text-slate-400 font-medium tracking-tight">natif pour </span>
                            <span className="text-slate-800 font-bold tracking-tighter">votre Mac.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl mx-auto mb-8 tracking-wide">
                            Fini les chatbots web. Elazya est une application macOS qui connecte l'IA (Claude, GPT-4) directement à vos fichiers, emails et applications locales pour automatiser votre travail, en toute confidentialité.
                        </p>

                        {/* CTA Button */}
                        <Link href="/pricing" className="inline-block w-full sm:w-auto">
                            <motion.button
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full sm:w-auto bg-[#0f172a] hover:bg-slate-800 text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-[0_12px_24px_rgb(15,23,42,0.3)] transition-all ring-1 ring-slate-800/20"
                            >
                                Télécharger pour Mac
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
