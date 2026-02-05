"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { href: "/#features", label: "Fonctionnalités" },
        { href: "/pricing", label: "Tarifs" },
        { href: "/faq", label: "FAQ" },
    ]

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-surface-0/80 backdrop-blur-md border-surface-3 py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-black flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/30">
                        <span className="text-black font-black text-lg">E</span>
                    </div>
                    <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent font-display italic tracking-tight">
                        ELAZYA
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                pathname === link.href ? "text-primary" : "text-foreground/80"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/checkout">
                        <Button variant="primary" size="sm" className="shadow-glow-cyan animate-pulse-slow">
                            Acheter pour 200€
                        </Button>
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden p-2 text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-surface-0 border-b border-surface-3 p-4 md:hidden flex flex-col gap-4 animate-in slide-in-from-top-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-lg font-medium py-2 px-4 hover:bg-surface-2 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link href="/checkout" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="primary" className="w-full">
                            Acheter Maintenant
                        </Button>
                    </Link>
                </div>
            )}
        </header>
    )
}
