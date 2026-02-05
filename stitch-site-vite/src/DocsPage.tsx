import React from 'react';

export const DocsPage: React.FC = () => {
    return (
        <div className="docs-page bg-background text-white min-h-screen font-sans">
            <div className="ambient-layer -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-primary opacity-20"></div>
            <div className="ambient-layer -bottom-[10%] -right-[10%] w-[60vw] h-[60vw] bg-secondary opacity-20 animation-delay-[-10s]"></div>

            <nav className="sticky top-0 z-50 bg-background/70 backdrop-blur-lg border-b border-glass-border py-4">
                <div className="container mx-auto px-5 flex justify-between items-center">
                    <div className="text-2xl font-bold flex items-center">
                        Elazya <span className="text-xs opacity-50 ml-2.5 font-normal tracking-widest bg-white/10 px-2 py-0.5 rounded">DOCS</span>
                    </div>
                    <div className="flex gap-6 items-center">
                        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = '' }} className="text-white hover:opacity-80 transition-opacity">Accueil</a>
                        <a href="#" className="text-white font-bold" onClick={(e) => e.preventDefault()}>Documentation</a>
                        <a href="#pricing" className="btn-secondary py-2 px-4 text-sm">Acheter</a>
                    </div>
                </div>
            </nav>

            <div className="flex min-h-screen pt-[80px]">
                <aside className="w-[250px] fixed top-[80px] bottom-0 left-0 p-8 border-r border-glass-border bg-black/50 backdrop-blur-md overflow-y-auto">
                    <div className="mb-8">
                        <div className="text-xs uppercase tracking-widest text-primary font-bold mb-4">Introduction</div>
                        <a href="#" className="block text-white py-2 pl-1 font-medium hover:text-white transition-colors">Commencer</a>
                        <a href="#" className="block text-white/70 py-2 hover:text-white transition-colors">Installation</a>
                        <a href="#" className="block text-white/70 py-2 hover:text-white transition-colors">Configuration</a>
                    </div>
                </aside>

                <main className="ml-[250px] p-16 max-w-4xl flex-1">
                    <h1 className="text-5xl font-bold mb-8">Bienvenue sur Elazya</h1>
                    <p className="text-lg opacity-90 mb-6 leading-relaxed">
                        Elazya est votre assistant personnel local, conçu pour respecter votre vie privée tout en augmentant votre productivité de manière exponentielle.
                    </p>

                    <div className="glass-card p-8 mb-12 bg-primary/10 border-primary/30">
                        <strong>🚀 En Bref :</strong> Elazya tourne 100% sur votre machine. Il utilise Gemini 2.5 Flash pour une rapidité extrême et peut interagir avec vos fichiers, votre terminal et vos applications.
                    </div>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Installation Rapide</h2>
                    <p className="mb-4">Copiez-collez cette commande dans votre terminal pour installer Elazya (Mac/Linux) :</p>

                    <div className="bg-black/30 border border-glass-border rounded-xl p-6 font-mono my-6 relative group">
                        <div className="absolute top-0 right-0 bg-glass-border px-3 py-1 text-xs rounded-bl-xl opacity-70">BASH</div>
                        <code>curl -sL https://elazya.com/install | bash</code>
                    </div>

                    <h2 className="text-3xl font-bold mt-12 mb-6">Premier Lancement</h2>
                    <p className="mb-4">Une fois installé, lancez simplement :</p>
                    <div className="bg-black/30 border border-glass-border rounded-xl p-6 font-mono my-6 relative">
                        <div className="absolute top-0 right-0 bg-glass-border px-3 py-1 text-xs rounded-bl-xl opacity-70">BASH</div>
                        <code>elazya start</code>
                    </div>
                </main>
            </div>
        </div>
    );
};
