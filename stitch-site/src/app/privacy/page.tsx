export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
            <h1 className="text-4xl font-bold mb-8">Politique de Confidentialité</h1>
            <p className="text-foreground/60 mb-12 italic">Dernière mise à jour : 29 janvier 2026</p>

            <div className="space-y-8 text-foreground/80 leading-relaxed">
                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">1. Principe Fondamental</h2>
                    <p>
                        Alizé est un logiciel local. Cela signifie que par défaut, **aucune donnée personnelle**
                        n'est envoyée à nos serveurs. Vos emails, vos notes, et vos conversations sont traités
                        exclusivement sur votre ordinateur.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">2. Collecte de données</h2>
                    <p>
                        Nous collectons uniquement les informations nécessaires au fonctionnement de la licence :
                    </p>
                    <ul className="list-disc pl-6 mt-4 space-y-2">
                        <li>Votre adresse email pour l'envoi de la clé.</li>
                        <li>Les détails de transaction Stripe pour la facturation.</li>
                        <li>Des logs d'erreur anonymisés (si vous activez cette option).</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4 text-primary">3. Hébergement</h2>
                    <p>
                        Alizé ne possède pas de stockage cloud pour vos données utilisateur. Si vous utilisez
                        une intégration web (ex: Search), les requêtes sont envoyées via HTTPS sécurisé
                        aux fournisseurs respectifs (Google Gemini, OpenAI, etc.), mais jamais stockées chez nous.
                    </p>
                </section>
            </div>
        </div>
    )
}
