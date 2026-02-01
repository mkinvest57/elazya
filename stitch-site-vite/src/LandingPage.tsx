import React from 'react';
import './style.css'; // Assuming styles are imported globally or converted to modules

export const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            {/* Ambient Blobs */}
            <div className="ambient-layer ambient-indigo" />
            <div className="ambient-layer ambient-pink" />
            <div className="ambient-layer ambient-purple" />

            {/* Nav */}
            <nav className="sticky-nav">
                <div className="container nav-content">
                    <div className="logo">🌬️ Alizé</div>
                    <div className="nav-links">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#demo">Démo</a>
                        <a href="#pricing">Tarifs</a>
                        <a href="#buy" className="btn btn-secondary">Acheter</a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <header className="hero-section">
                <div className="container hero-grid">
                    <div className="hero-text">
                        <h1>Libérez votre <br /><span className="gradient-text">Potentiel</span></h1>
                        <p className="hero-sub">
                            Alizé est votre second cerveau. Une IA locale, privée et autonome qui gère votre vie numérique sans jamais envoyer vos données dans le cloud.
                        </p>
                        <div className="cta-group">
                            <a href="#buy" className="btn btn-primary">Obtenir Alizé v1.0</a>
                            <a href="#demo" className="btn btn-glass">Voir la Démo</a>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="glass-card hero-card">
                            <div className="card-content">
                                <div className="interface-mockup">
                                    <div className="mockup-header">
                                        <span className="dot red" />
                                        <span className="dot yellow" />
                                        <span className="dot green" />
                                    </div>
                                    <div className="mockup-body">
                                        <div className="message system">Bonjour Sashimi, j'ai optimisé votre agenda.</div>
                                        <div className="message user">Merci Alizé. Lance le rendu vidéo.</div>
                                        <div className="message system">Rendu lancé. 14 min restantes.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Features */}
            <section id="features" className="features-section">
                <div className="container">
                    <h2 className="section-title">Pourquoi <span className="gradient-text">Alizé</span> ?</h2>
                    <div className="features-grid">
                        {[
                            { icon: "🔒", title: "100% Privé", text: "Vos données restent sur votre machine. Aucune télémétrie." },
                            { icon: "⚡", title: "Ultra Rapide", text: "Réponses instantanées grâce à Gemini 2.5 Flash." },
                            { icon: "🤖", title: "Autonomie", text: "Alizé agit pour vous : emails, calendrier, code." },
                            { icon: "🔌", title: "Multi-Canaux", text: "WhatsApp, Telegram, Discord, Slack, iMessage." }
                        ].map((f, i) => (
                            <div key={i} className="glass-card feature-card">
                                <div className="icon">{f.icon}</div>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="pricing-section">
                <div className="container pricing-container">
                    <div className="glass-card pricing-card">
                        <div className="badge">Early Access</div>
                        <h3>Licence Vie</h3>
                        <div className="price">49€</div>
                        <ul className="benefits">
                            <li>✅ Code Source Complet</li>
                            <li>✅ Mises à jour à vie</li>
                            <li>✅ 44 Skills inclus</li>
                            <li>✅ Support Discord</li>
                        </ul>
                        <a href="#" className="btn btn-primary full-width">Acheter Maintenant</a>
                        <p className="mute">Offre limitée.</p>
                    </div>
                </div>
            </section>

            <footer className="site-footer">
                <p>© 2026 Alizé AI. Conçu à Paris.</p>
            </footer>
        </div>
    );
};
