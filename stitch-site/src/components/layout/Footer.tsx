import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-surface-3 bg-surface-0 py-12 mt-20">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="text-2xl font-bold mb-4 block">
                            🌬️ Elazya
                        </Link>
                        <p className="text-sm text-foreground/60 leading-relaxed">
                            Votre assistant personnel local, privé et autonome.
                            Conçu pour respecter votre vie privée.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-primary">Produit</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/#features" className="hover:text-primary">Fonctionnalités</Link></li>
                            <li><Link href="/pricing" className="hover:text-primary">Tarifs</Link></li>
                            <li><Link href="/changelog" className="hover:text-primary">Mises à jour</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-primary">Ressources</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                            <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
                            <li><Link href="/community" className="hover:text-primary">Communauté</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-primary">Légal</h4>
                        <ul className="space-y-2 text-sm text-foreground/70">
                            <li><Link href="/privacy" className="hover:text-primary">Confidentialité</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">CGV</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-surface-3 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-foreground/40">
                        © 2026 Elazya AI. Tous droits réservés. Conçu à Paris.
                    </p>
                    <div className="flex gap-4">
                        {/* Social icons placeholders */}
                    </div>
                </div>
            </div>
        </footer>
    )
}
