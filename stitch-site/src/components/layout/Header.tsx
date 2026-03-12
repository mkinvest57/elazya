"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X, Menu } from "lucide-react"

export function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const scrollToPricing = () => {
        setIsMobileMenuOpen(false)
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <header className="flex items-center justify-between sticky top-0 z-50 backdrop-blur-md bg-white/70 px-8 py-4 border-b border-gray-100">
            {/* Logo */}
            <Link href="/" className="flex items-center">
                <span className="text-xl font-bold tracking-tight text-[#0f172a] font-geist">Elazya</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center">
                <button
                    onClick={scrollToPricing}
                    className="px-5 py-2 text-sm font-geist font-medium text-[#373a46] bg-transparent border border-gray-200 hover:bg-gray-50 rounded-full transition-colors"
                >
                    Voir les prix
                </button>
            </nav>

            {/* Mobile Toggle */}
            <button
                className="md:hidden flex items-center justify-center p-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 p-6 flex flex-col gap-4 shadow-lg md:hidden"
                    >
                        <button
                            onClick={scrollToPricing}
                            className="w-full text-center py-3 text-sm font-medium text-[#373a46] bg-transparent border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
                        >
                            Voir les prix
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
