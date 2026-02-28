/**
 * UpgradeBanner — In-app upgrade component.
 * 
 * Shows when user hits plan limit or views a locked agent.
 * Opens Stripe checkout in the browser via shell:open.
 * Listens for deep link callback to update license.
 */

import { useState } from 'react';
import { open } from '@tauri-apps/plugin-shell';
import { ElazyaPlan } from '../lib/license';
import { getUpgradeSuggestion } from '../lib/plan-limits';

// Stripe checkout URL — created via the website's /api/checkout
const SITE_URL = 'https://elazya.com';

interface UpgradeBannerProps {
    currentPlan: ElazyaPlan;
    variant?: 'banner' | 'card' | 'inline';
}

export function UpgradeBanner({ currentPlan, variant = 'banner' }: UpgradeBannerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const suggestion = getUpgradeSuggestion(currentPlan);

    if (!suggestion) return null; // Already at Business

    async function handleUpgrade() {
        if (isLoading) return;
        setIsLoading(true);

        try {
            // Determine the upgrade plan ID for the checkout page
            const upgradePlanId = currentPlan === 'solo' ? 'upgrade-solo-pro' : 'upgrade-pro-business';

            // Open the website checkout page in the default browser
            // The checkout page will handle Stripe session creation
            const checkoutUrl = `${SITE_URL}/checkout?plan=${upgradePlanId}&source=app`;
            await open(checkoutUrl);

            // The user will complete payment in their browser.
            // The success page will redirect to elazya://upgrade-success?plan=...
            // which Tauri's deep link handler will catch.
        } catch (err) {
            console.error('Failed to open upgrade page:', err);
        } finally {
            setIsLoading(false);
        }
    }

    // ── Banner variant (full-width, for Mission Control) ──
    if (variant === 'banner') {
        return (
            <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 via-yellow-500/10 to-amber-500/5 p-6">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">🚀</span>
                            <h3 className="text-lg font-bold text-white">Débloquez plus d'agents</h3>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">
                            Passez à <span className="text-yellow-500 font-semibold">{suggestion.label.replace('Passer au ', '')}</span> : {suggestion.benefits}
                        </p>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        disabled={isLoading}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)] hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Ouverture...
                            </span>
                        ) : (
                            `${suggestion.label} — ${suggestion.price}€`
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // ── Card variant (for agent library locked section) ──
    if (variant === 'card') {
        return (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-bold text-white mb-2">Agents {suggestion.label.replace('Passer au ', '')} verrouillés</h3>
                <p className="text-sm text-white/40 mb-6 max-w-sm mx-auto">
                    {suggestion.benefits}. Débloquez-les avec un upgrade.
                </p>
                <button
                    onClick={handleUpgrade}
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(234,179,8,0.4)] hover:scale-105 transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Ouverture...' : `${suggestion.label} — ${suggestion.price}€`}
                </button>
            </div>
        );
    }

    // ── Inline variant (small, for use in agent cards) ──
    return (
        <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl border border-yellow-500/30 text-yellow-500 font-semibold text-sm hover:bg-yellow-500/10 transition-colors disabled:opacity-50"
        >
            {isLoading ? 'Ouverture...' : `${suggestion.label} → ${suggestion.price}€`}
        </button>
    );
}

export default UpgradeBanner;
