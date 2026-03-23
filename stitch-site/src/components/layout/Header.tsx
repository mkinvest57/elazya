"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ArrowRight } from "lucide-react"

const navLinks = [
    { name: "Processus", href: "#processus" },
    { name: "Tarifs", href: "#pricing" },
    { name: "Avis", href: "#avis" },
    { name: "FAQ", href: "#faq" },
]

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <header className="fixed top-4 left-4 right-4 z-50">
            <nav className="max-w-[1100px] mx-auto bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] px-5 py-3 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-xl font-bold tracking-tight text-[#0f172a] font-geist hover:opacity-80 transition-opacity">
                    Elazya
                </Link>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="text-sm font-geist font-medium text-[#373a46] hover:text-[#0f172a] transition-colors cursor-pointer relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-blue-600 after:transition-all hover:after:w-full"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <a
                    href="#booking"
                    className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-geist font-semibold text-white text-sm bg-[#0f172a] hover:bg-[#1e293b] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                    Planifier un Appel Gratuit
                    <ArrowRight className="w-3.5 h-3.5" />
                </a>

                {/* Mobile toggle */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </nav>

            {/* Mobile menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden mt-2 mx-auto max-w-[1100px] bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg px-5 py-4"
                    >
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="py-3 px-3 text-sm font-geist font-medium text-[#373a46] hover:text-[#0f172a] hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <div className="border-t border-gray-100 my-2" />
                            <a
                                href="#booking"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 py-3 rounded-xl font-geist font-semibold text-white text-sm bg-[#0f172a] cursor-pointer"
                            >
                                Planifier un Appel Gratuit
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
