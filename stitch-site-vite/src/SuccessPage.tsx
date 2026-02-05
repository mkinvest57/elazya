import React from 'react';

export const SuccessPage: React.FC = () => {
    return (
        <div className="success-page bg-background text-white min-h-screen font-sans flex flex-col items-center justify-center relative overflow-hidden">
            {/* Ambient Background */}
            <div className="ambient-layer top-[20%] left-[20%] w-[60vw] h-[60vw] bg-green-500 opacity-20 blur-[120px] rounded-full absolute pointer-events-none animate-pulse"></div>
            <div className="ambient-layer bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-primary opacity-10 blur-[100px] rounded-full absolute pointer-events-none"></div>

            <div className="container mx-auto px-4 z-10 relative text-center max-w-2xl">

                {/* Success Icon Animation */}
                <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                    <span className="text-5xl animate-bounce">🎉</span>
                </div>

                <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-green-200 to-green-400">
                    Paiement Réussi !
                </h1>

                <p className="text-xl text-white/80 mb-10 leading-relaxed">
                    Merci de faire confiance à <strong className="text-white">Elazya</strong>. <br />
                    Votre licence à vie est activée. Vous pouvez dès maintenant libérer votre potentiel.
                </p>

                {/* Installation Card */}
                <div className="glass-card bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl mb-10 shadow-2xl">
                    <h3 className="text-lg font-semibold mb-4 text-left flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Démarrage Immédiat
                    </h3>
                    <p className="text-sm text-white/60 text-left mb-4">
                        Copiez cette commande dans votre terminal pour installer et lancer Elazya :
                    </p>
                    <div className="bg-black/80 border border-white/10 rounded-lg p-4 group relative text-left">
                        <code className="font-mono text-green-400 text-sm break-all">
                            curl -sL https://elazya.com/install | bash
                        </code>
                        <div className="absolute top-2 right-2 text-[10px] text-white/30 uppercase tracking-widest">Bash</div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="https://discord.gg/elazya" target="_blank" rel="noreferrer" className="btn bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-2">
                        <span>Rejoindre le Discord Support</span>
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = '' }} className="btn bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/5">
                        Retour à l'accueil
                    </a>
                </div>

                <div className="mt-16 pt-8 border-t border-white/5 text-sm text-white/40">
                    <p>Un email de confirmation contenant votre facture a été envoyé.</p>
                    <p>ID de transaction : <span className="font-mono bg-white/10 px-1 rounded">ELZ-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
                </div>
            </div>
        </div>
    );
};
