import { Card } from "@/components/ui/Card"

export default function FAQPage() {
    const faqs = [
        {
            q: "C'est quoi exactement Alizé?",
            a: "Alizé est un assistant IA personnel qui tourne sur VOTRE ordinateur. Il n'est pas dans le cloud, il n'envoie rien à Internet sans votre permission. Il parle avec vous via WhatsApp, Telegram, iMessage, Email, ou Slack."
        },
        {
            q: "J'ai zéro compétences techniques. C'est faisable?",
            a: "Oui, 100%. Installation = 1 clic. Aucune config requise. Si vous pouvez ouvrir WhatsApp, vous pouvez utiliser Alizé."
        },
        {
            q: "Ça utilise quelle IA?",
            a: "Google Gemini par défaut (gratuit, 2M tokens/mois). Vous pouvez passer à Claude, GPT-4, ou autre si vous préférez."
        },
        {
            q: "Mes données, elles vont où?",
            a: "Nulle part. Alizé tourne SUR VOTRE ORDINATEUR. Aucune donnée n'est envoyée à nos serveurs. Vos données = 100% privées."
        },
        {
            q: "Que se passe si vous fermez le projet?",
            a: "Le code est open-source. Vous ne perdez JAMAIS votre licence."
        },
        {
            q: "C'est sécurisé?",
            a: "Oui. HTTPS partout. Encryption end-to-end pour messages. Audit de sécurité complète en Q1 2026."
        },
        {
            q: "Je peux me faire rembourser?",
            a: "Oui, 30 jours satisfait ou remboursé. Zéro question posée."
        }
    ]

    return (
        <div className="container mx-auto px-4 py-24 md:py-32 max-w-3xl">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-4">Questions Fréquentes</h1>
                <p className="text-xl text-foreground/60">Tout ce que vous devez savoir</p>
            </div>

            <div className="space-y-4">
                {faqs.map((faq, i) => (
                    <Card key={i} className="group hover:border-primary/50 transition-colors">
                        <details className="group">
                            <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-lg">
                                <span>{faq.q}</span>
                                <span className="transition-transform group-open:rotate-180">↓</span>
                            </summary>
                            <div className="text-foreground/70 mt-4 leading-relaxed animate-in slide-in-from-top-2">
                                {faq.a}
                            </div>
                        </details>
                    </Card>
                ))}
            </div>
        </div>
    )
}
