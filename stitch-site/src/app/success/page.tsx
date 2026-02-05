"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Download, MessageCircle, Home, Check, Sparkles, Shield, Zap } from 'lucide-react'

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-background text-white font-sans flex flex-col items-center justify-center relative overflow-hidden py-20">
            {/* Ambient Background */}
            <div className="absolute top-[10%] left-[10%] w-[80vw] h-[80vw] bg-green-500 opacity-15 blur-[150px] rounded-full pointer-events-none animate-pulse"></div>
            <div className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] bg-primary opacity-10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 z-10 relative text-center max-w-3xl">

                {/* Success Icon Animation */}
                <div className="mb-8 inline-flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 border-2 border-green-500/50 shadow-[0_0_60px_rgba(34,197,94,0.4)]">
                    <span className="text-6xl animate-bounce">🎉</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-green-200 to-green-400">
                    Paiement Réussi !
                </h1>

                <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed max-w-xl mx-auto">
                    Bienvenue dans la famille <strong className="text-primary">Elazya</strong>.
                    Votre licence perpétuelle est activée.
                </p>

                {/* Download Card - Hero */}
                <Card variant="pricing" className="p-10 mb-10 text-left">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 blur-3xl rounded-full"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Download className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Téléchargez Elazya</h3>
                            <p className="text-sm text-white/60">Version 1.0.0 • macOS Apple Silicon</p>
                        </div>
                    </div>

                    <a
                        href="https://elazya.com/downloads/Elazya_1.0.0_aarch64.dmg"
                        download
                        className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-5 rounded-xl font-bold text-xl transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Download className="w-6 h-6" />
                        Télécharger pour Mac
                        <span className="text-sm font-normal opacity-80">(7 MB)</span>
                    </a>

                    <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-white/60">44 Skills IA</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-white/60">100% Local</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-white/60">Autonome</span>
                        </div>
                    </div>
                </Card>

                {/* Installation Instructions */}
                <Card className="p-8 mb-10 text-left bg-amber-500/5 border-amber-500/20">
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-amber-400">
                        <Shield className="w-5 h-5" />
                        Instructions d'installation
                    </h4>
                    <p className="text-sm text-white/70 mb-6">
                        macOS peut afficher un avertissement de sécurité car l'application n'est pas signée Apple. Suivez ces étapes :
                    </p>
                    <ol className="space-y-4 text-sm">
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">1</span>
                            <span className="text-white/80">Ouvrez le fichier <strong className="text-white">.dmg</strong> téléchargé</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">2</span>
                            <span className="text-white/80">Glissez <strong className="text-white">Elazya</strong> dans le dossier <strong className="text-white">Applications</strong></span>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">3</span>
                            <div className="text-white/80">
                                <span>Ouvrez le <strong className="text-white">Terminal</strong> et exécutez :</span>
                                <div className="mt-2 bg-black/50 rounded-lg p-3 font-mono text-xs text-green-400 overflow-x-auto">
                                    xattr -cr /Applications/Elazya.app
                                </div>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold shrink-0">4</span>
                            <span className="text-white/80">Double-cliquez sur <strong className="text-white">Elazya</strong> pour lancer l'application 🎉</span>
                        </li>
                    </ol>
                </Card>

                {/* What's Included */}
                <Card className="p-8 mb-10 text-left">
                    <h4 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Inclus avec votre licence
                    </h4>
                    <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-white/80">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</span>
                            Application Elazya v1.0 pour macOS
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</span>
                            Mises à jour à vie incluses
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</span>
                            Accès VIP au Discord support
                        </li>
                        <li className="flex items-center gap-3 text-white/80">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-sm">✓</span>
                            Facture pour notes de frais
                        </li>
                    </ul>
                </Card>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://discord.gg/elazya"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-[#5865F2] border-[#5865F2] hover:bg-[#4752C4] text-white">
                            <MessageCircle className="w-5 h-5 mr-2" />
                            Rejoindre le Discord
                        </Button>
                    </a>
                    <Link href="/">
                        <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                            <Home className="w-5 h-5 mr-2" />
                            Retour à l'accueil
                        </Button>
                    </Link>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-sm text-white/40">
                    <p>Un email de confirmation contenant votre facture a été envoyé.</p>
                    <p className="mt-2">Besoin d'aide ? <a href="mailto:support@elazya.com" className="text-primary hover:underline">support@elazya.com</a></p>
                </div>
            </div>
        </div>
    );
};
