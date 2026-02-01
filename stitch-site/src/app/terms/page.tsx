export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Conditions Générales de Vente (CGV)</h1>
            <p className="text-foreground/60 mb-12 italic">Dernière mise à jour : 29 janvier 2026</p>

            <div className="space-y-8 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">1. Objet</h2>
                    <p>
                        Les présentes CGV régissent la vente de la licence perpétuelle du logiciel Alizé.
                        En achetant Alizé, vous acceptez sans réserve ces conditions.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">2. Licence Perpétuelle</h2>
                    <p>
                        L'achat à 200€ octroie une licence à vie pour une utilisation personnelle.
                        Les mises à jour mineures sont incluses gratuitement pour toujours.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">3. Remboursement</h2>
                    <p>
                        Conformément à notre politique commerciale, vous disposez de **30 jours**
                        après l'achat pour demander un remboursement intégral si le logiciel ne
                        répond pas à vos attentes.
                    </p>
                </section>
            </div>
        </div>
    )
}
