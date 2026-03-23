"use client"

import Link from "next/link"

const navLinks = [
    { label: "Processus", href: "#processus" },
    { label: "Tarifs", href: "#pricing" },
    { label: "Avis clients", href: "#avis" },
    { label: "FAQ", href: "#faq" },
]

const legalLinks = [
    { label: "Mentions légales", href: "/terms" },
    { label: "Politique de confidentialité", href: "/privacy" },
    { label: "CGU / CGV", href: "/terms" },
]

export function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-[1100px] mx-auto px-6 py-14 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                    {/* Logo + socials */}
                    <div className="md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <span className="text-xl font-bold tracking-tight text-[#0f172a] font-geist">Elazya</span>
                        </Link>
                        <p className="text-sm font-geist text-gray-500 leading-relaxed mb-6">
                            Intelligence Artificielle Personnelle.
                            <br />100% locale sur Mac.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.linkedin.com/company/elazya"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0f172a] hover:bg-gray-200 transition-colors"
                                aria-label="LinkedIn"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                            </a>
                            <a
                                href="https://www.instagram.com/elazya.ai"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#0f172a] hover:bg-gray-200 transition-colors"
                                aria-label="Instagram"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-xs font-geist font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Navigation
                        </h4>
                        <ul className="space-y-3">
                            {navLinks.map((link) => (
                                <li key={link.href}>
                                    <a
                                        href={link.href}
                                        className="text-sm font-geist text-[#373a46] hover:text-[#0f172a] transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-xs font-geist font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Légal
                        </h4>
                        <ul className="space-y-3">
                            {legalLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm font-geist text-[#373a46] hover:text-[#0f172a] transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-xs font-geist font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Contact
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:rayan@elazya.com"
                                    className="text-sm font-geist text-[#373a46] hover:text-[#0f172a] transition-colors"
                                >
                                    rayan@elazya.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#booking"
                                    className="text-sm font-geist text-blue-600 hover:text-blue-700 transition-colors font-medium"
                                >
                                    Planifier un appel →
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-gray-200 mt-12 pt-8 text-center">
                    <p className="text-xs font-geist text-gray-400">
                        © 2026 Elazya. 100% Native on Apple Silicon. Conçu à Paris.
                    </p>
                </div>
            </div>
        </footer>
    )
}
