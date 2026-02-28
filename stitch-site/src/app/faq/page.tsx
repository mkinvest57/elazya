"use client"

import { motion } from "framer-motion"
import { useState } from "react"

const categories = [
    {
        name: "Général",
        faqs: [
            {
                q: "C'est quoi exactement Elazya ?",
                a: "Elazya est un assistant IA personnel qui tourne directement sur votre Mac. Il utilise les meilleurs modèles d'IA (Gemini, Claude, GPT-4) pour gérer vos emails, organiser vos fichiers, et automatiser vos tâches — le tout en gardant vos données 100% locales."
            },
            {
                q: "En quoi c'est différent de ChatGPT ou Siri ?",
                a: "ChatGPT est dans le cloud et ne peut pas accéder à vos fichiers. Siri est limité par Apple. Elazya est un agent local autonome qui possède les clés de votre système : il lit vos emails, gère vos calendriers, organise vos dossiers, et bien plus."
            },
        ]
    },
    {
        name: "Installation",
        faqs: [
            {
                q: "J'ai zéro compétence technique. C'est faisable ?",
                a: "Oui, 100%. L'installation se fait en 1 clic. Un wizard vous guide ensuite pour configurer vos comptes et services. Si vous savez utiliser un Mac, vous savez utiliser Elazya."
            },
            {
                q: "Quel modèle d'IA est utilisé ?",
                a: "Google Gemini par défaut (gratuit, 2M tokens/mois). Vous pouvez passer à Claude, GPT-4, Mistral ou d'autres si vous le souhaitez."
            },
        ]
    },
    {
        name: "Confidentialité",
        faqs: [
            {
                q: "Mes données restent vraiment privées ?",
                a: "Oui. Elazya tourne intégralement sur votre ordinateur. Aucune donnée n'est envoyée à nos serveurs. Vos fichiers, emails et conversations restent chez vous."
            },
            {
                q: "C'est sécurisé ?",
                a: "Oui. HTTPS partout, chiffrement end-to-end pour les messages. Toutes les données sont stockées localement avec les protections système de macOS (SIP, Gatekeeper)."
            },
        ]
    },
    {
        name: "Facturation",
        faqs: [
            {
                q: "Je peux essayer gratuitement ?",
                a: "Oui, le plan Starter est entièrement gratuit avec 5 compétences de base et le modèle Gemini. Aucune carte bancaire requise."
            },
            {
                q: "Je peux me faire rembourser ?",
                a: "Oui, 30 jours satisfait ou remboursé sur les plans payants. Aucune question posée."
            },
            {
                q: "Que se passe-t-il si vous fermez le projet ?",
                a: "Le moteur d'Elazya repose sur des technologies open-source. Vous ne perdez jamais votre installation ni vos données."
            },
        ]
    },
]

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState("Général")

    return (
        <div className="min-h-screen bg-background text-slate-800">
            {/* Minimalist Grid & Blur Background */}
            <div className="fixed inset-0 z-0 opacity-40 mix-blend-multiply pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-blue-300 blur-[150px] rounded-full"></div>
            </div>
            
            <div className="fixed inset-0 bg-primary/[0.02] grain-light pointer-events-none z-0" />

            <div className="relative z-10 container mx-auto px-4 py-32 md:py-40 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                        <span className="text-slate-800">Questions</span>
                        {' '}
                        <span className="text-gradient-primary">fréquentes</span>
                    </h1>
                    <p className="text-lg text-slate-500 font-medium">
                        Tout ce que vous devez savoir sur Elazya
                    </p>
                </motion.div>

                {/* Category tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${activeCategory === cat.name
                                    ? 'bg-primary text-white shadow-md hover:bg-primary/90 hover:-translate-y-0.5'
                                    : 'text-slate-600 bg-white border border-slate-200 hover:text-slate-900 hover:bg-slate-50 hover:-translate-y-0.5'
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* FAQ items */}
                <div className="space-y-4">
                    {categories
                        .find(c => c.name === activeCategory)
                        ?.faqs.map((faq, i) => (
                            <motion.div
                                key={`${activeCategory}-${i}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <details className="group p-6 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
                                    <summary className="flex justify-between items-center font-bold cursor-pointer list-none text-slate-800 text-lg">
                                        <span>{faq.q}</span>
                                        <span className="text-primary transition-transform group-open:rotate-180 ml-4 shrink-0 text-xl">+</span>
                                    </summary>
                                    <p className="text-base text-slate-500 font-medium mt-4 leading-relaxed">{faq.a}</p>
                                </details>
                            </motion.div>
                        ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-16 p-10 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm">
                    <p className="text-slate-600 font-medium text-lg mb-3">Vous ne trouvez pas votre réponse ?</p>
                    <a
                        href="mailto:support@elazya.com"
                        className="inline-flex items-center text-primary hover:text-primary/80 transition-colors font-bold text-lg hover:underline underline-offset-4"
                    >
                        Contactez notre équipe →
                    </a>
                </div>
            </div>
        </div>
    )
}
