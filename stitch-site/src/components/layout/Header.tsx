"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToPricing = () => {
        setIsMobileMenuOpen(false)
        document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isScrolled
                    ? "bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 py-3"
                    : "bg-transparent border-b border-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <Image src="/logo.png" alt="Elazya" width={32} height={32} className="rounded-lg group-hover:scale-105 transition-transform" />
                    <span className="text-xl font-bold tracking-tight text-slate-800">Elazya</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <button
                        onClick={scrollToPricing}
                        className="px-5 py-2.5 text-[13px] font-bold text-white bg-[#0f172a] hover:bg-slate-800 rounded-full shadow-[0_4px_12px_rgb(15,23,42,0.2)] transition-all ring-1 ring-slate-800/20"
                    >
                        Voir les prix
                    </button>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden flex items-center justify-center w-10 h-10 text-slate-700 bg-white/50 border border-slate-300/80 rounded-full hover:bg-slate-50 transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 p-6 md:hidden flex flex-col gap-2 shadow-lg"
                    >
                        <button
                            onClick={scrollToPricing}
                            className="block w-full text-center py-3 text-sm font-bold text-white bg-[#0f172a] rounded-full shadow-md"
                        >
                            Voir les prix
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
