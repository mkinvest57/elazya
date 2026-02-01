"use client"

import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Book, Code, Terminal, Mail, Calendar, Search, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
    const sections = [
        {
            id: "bienvenue",
            title: "Bienvenue",
            group: "Introduction",
            content: "Alizé est votre assistant personnel local. Contrairement aux IA cloud, Alizé vit sur votre machine, respecte votre vie privée et ne nécessite pas d'abonnement mensuel."
        },
        {
            id: "installation",
            title: "Installation",
            group: "Introduction",
            content: "Pour installer Alizé, téléchargez le binaire depuis votre dashboard, décompressez-le et lancez l'exécutable. Aucune configuration complexe n'est requise."
        },
        {
            id: "premiers-pas",
            title: "Premier pas",
            group: "Introduction",
            content: "Une fois lancé, connectez Alizé à votre application de messagerie préférée (WhatsApp, Telegram ou Slack) en scannant le QR code affiché."
        },
        {
            id: "email",
            title: "Email & Calendrier",
            group: "Utilisation",
            content: "Alizé peut lire vos emails, résumer les conversations importantes et ajouter des événements à votre calendrier directement depuis vos messages."
        },
        {
            id: "search",
            title: "Web Search",
            group: "Utilisation",
            content: "Posez simplement une question à Alizé. Il effectuera une recherche web sécurisée et vous fournira une réponse synthétisée avec les sources."
        },
        {
            id: "notes",
            title: "Apple Notes",
            group: "Utilisation",
            content: "Synchronisez vos idées. Alizé peut créer, modifier et organiser vos notes dans Apple Notes via des commandes vocales ou textuelles."
        }
    ]

    return (
        <div className="container mx-auto px-4 py-24 md:py-32 flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <aside className="lg:w-64 space-y-8 lg:sticky lg:top-24 h-fit">
                <div>
                    <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Introduction</h4>
                    <ul className="space-y-2 text-sm">
                        {sections.filter(s => s.group === "Introduction").map(section => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-primary">Utilisation</h4>
                    <ul className="space-y-2 text-sm">
                        {sections.filter(s => s.group === "Utilisation").map(section => (
                            <li key={section.id}>
                                <a
                                    href={`#${section.id}`}
                                    className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group"
                                >
                                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 max-w-3xl space-y-20">
                <section>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Documentation Alizé</h1>
                    <p className="text-xl text-foreground/60 mb-8">
                        Apprenez à maîtriser Alizé et transformez votre façon de travailler avec l'IA locale.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-6 border-primary/20 bg-primary/5">
                            <Terminal className="w-8 h-8 text-primary mb-4" />
                            <h3 className="font-bold mb-2">CLI Ready</h3>
                            <p className="text-sm text-foreground/70">Interface en ligne de commande pour les power users.</p>
                        </Card>
                        <Card className="p-6 border-secondary/20 bg-secondary/5">
                            <Code className="w-8 h-8 text-secondary mb-4" />
                            <h3 className="font-bold mb-2">API Documentation</h3>
                            <p className="text-sm text-foreground/70">Documentation technique pour intégrations tierces.</p>
                        </Card>
                    </div>
                </section>

                {sections.map(section => (
                    <section key={section.id} id={section.id} className="scroll-mt-28">
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                            <span className="w-8 h-8 text-primary/50 text-base flex items-center justify-center border border-primary/20 rounded-lg">#</span>
                            {section.title}
                        </h2>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-lg text-foreground/70 leading-relaxed mb-6">
                                {section.content}
                            </p>
                            {section.id === "installation" && (
                                <div className="bg-surface-2 p-6 rounded-xl border border-surface-3 font-mono text-sm overflow-x-auto">
                                    <p className="text-primary/70 mb-2"># Install command</p>
                                    <p>curl -sSf https://alize.ai/install.sh | sh</p>
                                </div>
                            )}
                            {section.id === "email" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <div className="flex items-center gap-3 p-4 bg-surface-1 rounded-lg border border-surface-3">
                                        <Mail className="w-5 h-5 text-primary" />
                                        <span className="text-sm">Gmail & Outlook</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-surface-1 rounded-lg border border-surface-3">
                                        <Calendar className="w-5 h-5 text-secondary" />
                                        <span className="text-sm">Google Calendar</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ))}

                <div className="pt-20 border-t border-surface-3">
                    <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-transparent">
                        <h3 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h3>
                        <p className="text-foreground/60 mb-8">
                            Notre communauté est disponible 24/7 sur Discord pour vous aider.
                        </p>
                        <Link href="/community">
                            <Button>Rejoindre la Communauté</Button>
                        </Link>
                    </Card>
                </div>
            </main>
        </div>
    )
}
