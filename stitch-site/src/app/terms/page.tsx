"use client"

import { motion } from "framer-motion"

const sections = [
    {
        title: "1. Objet",
        content: "Les présentes Conditions Générales de Vente (CGV) régissent l'accès et l'utilisation du logiciel Elazya, proposé par la société Elazya AI, enregistrée en France. En souscrivant à un plan ou en utilisant le logiciel, vous acceptez sans réserve les présentes conditions."
    },
    {
        title: "2. Description du Service",
        content: "Elazya est un assistant d'intelligence artificielle fonctionnant localement sur votre machine (macOS). Le logiciel exploite des modèles de langage (LLM) via les clés API que vous fournissez, et offre 44 compétences automatisées (email, calendrier, fichiers, terminal, etc.). Les données sont traitées localement et ne transitent jamais par nos serveurs."
    },
    {
        title: "3. Formules d'Abonnement",
        content: "Elazya propose trois formules : Starter (gratuit, 5 compétences, modèle Gemini), Pro (79€/mois ou 790€/an, 44 compétences, tous les modèles IA, support prioritaire), et Enterprise (sur mesure, déploiement équipe, SLA garanti). Les abonnements payants se renouvellent automatiquement au terme de chaque période de facturation."
    },
    {
        title: "4. Paiement et Facturation",
        content: "Les paiements sont traités de manière sécurisée via Stripe. Les prix sont indiqués hors taxes (HT) et la TVA applicable sera ajoutée lors du paiement. Une facture est émise automatiquement à chaque paiement et accessible depuis votre espace client."
    },
    {
        title: "5. Droit de Rétractation",
        content: "Conformément à notre politique commerciale et au Code de la consommation, vous disposez d'un délai de 30 jours à compter de la première souscription pour demander un remboursement intégral, sans justification. La demande doit être adressée à support@elazya.com."
    },
    {
        title: "6. Résiliation",
        content: "Vous pouvez résilier votre abonnement à tout moment depuis votre espace client ou en contactant notre support. La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement au prorata ne sera effectué pour la période restante."
    },
    {
        title: "7. Propriété Intellectuelle",
        content: "Elazya et ses composants logiciels restent la propriété exclusive d'Elazya AI. La souscription confère un droit d'utilisation non exclusif, non transférable et non cessible du logiciel pour votre usage personnel ou professionnel selon la formule souscrite."
    },
    {
        title: "8. Limitation de Responsabilité",
        content: "Elazya AI ne saurait être tenu responsable des dommages directs ou indirects résultant de l'utilisation du logiciel, notamment les pertes de données, les interruptions de service des fournisseurs LLM tiers, ou les actions automatisées effectuées par les compétences du logiciel. L'utilisateur reste responsable de la vérification des actions effectuées par l'assistant."
    },
    {
        title: "9. Droit Applicable",
        content: "Les présentes CGV sont soumises au droit français. Tout litige sera soumis à la compétence exclusive des tribunaux de Paris, sauf disposition légale contraire."
    },
    {
        title: "10. Contact",
        content: "Pour toute question relative aux présentes CGV, contactez-nous à l'adresse : rayan@elazya.com"
    },
]

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-slate-800 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] bg-blue-300/[0.2] mix-blend-multiply blur-[150px] rounded-full pointer-events-none" />
            
            <div className="absolute inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="container mx-auto px-4 py-32 md:py-40 max-w-3xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-slate-800">Conditions Générales de Vente</h1>
                    <p className="text-slate-400 font-medium mb-16 text-sm uppercase tracking-widest">Dernière mise à jour : 11 février 2026</p>
                </motion.div>

                <div className="space-y-10">
                    {sections.map((section, i) => (
                        <motion.section
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * i }}
                            className="bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm p-8 rounded-3xl"
                        >
                            <h2 className="text-xl font-bold tracking-tight mb-3 text-primary">{section.title}</h2>
                            <p className="text-slate-600 font-medium leading-relaxed">{section.content}</p>
                        </motion.section>
                    ))}
                </div>
            </div>
        </div>
    )
}
