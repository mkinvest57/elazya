import { Card } from "@/components/ui/Card"

export default function ChangelogPage() {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
            <h1 className="text-4xl font-bold mb-4 text-center">Journal des Mises à jour</h1>
            <p className="text-xl text-foreground/60 text-center mb-16">
                L'évolution constante d'Elazya, pour une IA toujours plus performante.
            </p>

            <div className="space-y-12 relative border-l border-surface-3 pl-8 ml-4">
                <div className="relative">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-primary shadow-glow-cyan border-4 border-surface-0"></div>
                    <div className="mb-2 flex items-center gap-4">
                        <span className="text-primary font-bold">v2.1.0</span>
                        <span className="text-foreground/40 text-sm">29 Janvier 2026</span>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-bold mb-2 italic">La révolution Next.js</h3>
                        <ul className="list-disc pl-6 space-y-2 text-foreground/70 text-sm">
                            <li>Migration vers Next.js 14 App Router pour des performances fulgurantes.</li>
                            <li>Nouveau système de design "Elazya 2.0" ultra-fluide.</li>
                            <li>Intégration Stripe pour un checkout en 1 clic.</li>
                        </ul>
                    </Card>
                </div>

                <div className="relative opacity-60">
                    <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-secondary border-4 border-surface-0"></div>
                    <div className="mb-2 flex items-center gap-4">
                        <span className="text-secondary font-bold">v2.0.4</span>
                        <span className="text-foreground/40 text-sm">15 Janvier 2026</span>
                    </div>
                    <Card className="p-6">
                        <h3 className="font-bold mb-2 italic">Support Apple Notes</h3>
                        <p className="text-sm text-foreground/70">
                            Elazya peut maintenant lire et écrire dans vos Apple Notes directement.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    )
}
