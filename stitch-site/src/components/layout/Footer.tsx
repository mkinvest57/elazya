import Link from "next/link"
import Image from "next/image"

export function Footer() {
    return (
        <footer className="relative border-t border-slate-200/60 bg-[#f8fbff] pt-16 pb-8 mt-0">
            {/* Top gradient line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2.5 mb-4 group">
                            <Image src="/logo.png" alt="Elazya" width={28} height={28} className="rounded-lg group-hover:scale-105 transition-transform" />
                            <span className="text-base font-bold tracking-tight text-slate-800">Elazya</span>
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mb-6 font-medium">
                            L'assistant IA qui vit sur votre machine. Privé, local, et puissant.
                        </p>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                            <span className="inline-block w-2 h-2 rounded-full bg-success" />
                            <span>Tous les systèmes opérationnels</span>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-slate-900">Produit</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link href="/#features" className="hover:text-primary transition-colors">Fonctionnalités</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary transition-colors">Tarifs</Link></li>
                            <li><Link href="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
                            <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-slate-900">Ressources</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link href="/community" className="hover:text-primary transition-colors">Communauté</Link></li>
                            <li><a href="https://discord.gg/elazya" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Discord</a></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-semibold mb-4 text-sm text-slate-900">Légal</h4>
                        <ul className="space-y-3 text-sm font-medium text-slate-500">
                            <li><Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link></li>
                            <li><Link href="/terms" className="hover:text-primary transition-colors">CGV</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-slate-200/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs font-bold text-slate-400">
                        © 2026 Elazya AI. Tous droits réservés.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span>Conçu à Paris 🇫🇷</span>
                        <span className="hidden md:inline">·</span>
                        <span className="hidden md:inline">Privacy-first by design</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
