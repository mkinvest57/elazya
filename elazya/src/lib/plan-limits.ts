/**
 * Plan limits and feature gating for Elazya.
 * 
 * Controls which agents and features are available per plan tier.
 * Updated: 10 agents (5 Core, 3 Pro, 2 Business)
 */

import { ElazyaPlan } from './license';

export interface PlanLimits {
    maxAgents: number;
    maxUsers: number;
    maxMachines: number;
    label: string;
    color: string;
    badgeColor: string;
}

export const PLAN_LIMITS: Record<ElazyaPlan, PlanLimits> = {
    solo: {
        maxAgents: 5,
        maxUsers: 1,
        maxMachines: 1,
        label: 'Solo',
        color: 'text-green-400',
        badgeColor: 'bg-green-500/10 border-green-500/20 text-green-400',
    },
    pro: {
        maxAgents: 8,
        maxUsers: 3,
        maxMachines: 3,
        label: 'Pro',
        color: 'text-yellow-500',
        badgeColor: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    },
    business: {
        maxAgents: 10,
        maxUsers: 10,
        maxMachines: Infinity,
        label: 'Business',
        color: 'text-indigo-400',
        badgeColor: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    },
};

/**
 * Agent definitions and their required plan tier.
 */
export interface AgentDef {
    id: string;
    name: string;
    emoji: string;
    description: string;
    icon: string;
    tier: 'solo' | 'pro' | 'business';
    category: string;
    savings: string;
    setupTime: string;
}

export const ALL_AGENTS: AgentDef[] = [
    // Core (Solo+) — 5 agents
    { id: 'facturation', name: 'Facturation Auto', emoji: '💰', description: 'Classe vos factures, relances si impayés', icon: 'FileText', tier: 'solo', category: 'Core', savings: '2h/semaine', setupTime: '2 min' },
    { id: 'onboarding-client', name: 'Onboarding Client Express', emoji: '📧', description: 'Répondez aux prospects en 5 min', icon: 'Mail', tier: 'solo', category: 'Core', savings: '1h/client', setupTime: '3 min' },
    { id: 'linkedin-digest', name: 'LinkedIn Digest', emoji: '📱', description: 'Contenu quotidien sans effort', icon: 'Linkedin', tier: 'solo', category: 'Core', savings: '3h30/semaine', setupTime: '1 min' },
    { id: 'qualification', name: 'Qualification Leads Auto', emoji: '🎯', description: 'Triez les vrais prospects des curieux', icon: 'Target', tier: 'solo', category: 'Core', savings: '5h/semaine', setupTime: '2 min' },
    { id: 'routine-matinale', name: 'Routine Matinale Auto', emoji: '🏃', description: 'Commencez la journée immédiatement', icon: 'Sun', tier: 'solo', category: 'Core', savings: '30min/jour', setupTime: '1 min' },

    // Pro — 3 agents
    { id: 'crm-prospect', name: 'CRM Prospect Auto', emoji: '🎨', description: 'Jamais de lead perdu', icon: 'Users', tier: 'pro', category: 'Pro', savings: '+30% conversion', setupTime: '3 min' },
    { id: 'devis-express', name: 'Devis Express', emoji: '📄', description: 'Propositions en 10min vs 2h', icon: 'Receipt', tier: 'pro', category: 'Pro', savings: '+20% conversion', setupTime: '2 min' },
    { id: 'email-intelligent', name: 'Email Intelligent', emoji: '💼', description: 'Inbox traitée automatiquement', icon: 'Brain', tier: 'pro', category: 'Pro', savings: '1h/jour', setupTime: '4 min' },

    // Business — 2 agents
    { id: 'compta-export', name: 'Compta Export', emoji: '📊', description: 'Export comptable mensuel auto', icon: 'BarChart3', tier: 'business', category: 'Business', savings: '2h/mois', setupTime: '3 min' },
    { id: 'content-linkedin', name: 'Content Auto LinkedIn', emoji: '🚀', description: '1 idée → 5 posts variations', icon: 'PenTool', tier: 'business', category: 'Business', savings: '4h/semaine', setupTime: '1 min' },
];

const TIER_ORDER: Record<string, number> = { solo: 0, pro: 1, business: 2 };

/**
 * Check if a plan can access a specific agent.
 */
export function canAccessAgent(plan: ElazyaPlan, agentTier: 'solo' | 'pro' | 'business'): boolean {
    return TIER_ORDER[plan] >= TIER_ORDER[agentTier];
}

/**
 * Get agents available for a plan.
 */
export function getAvailableAgents(plan: ElazyaPlan): AgentDef[] {
    return ALL_AGENTS.filter(a => canAccessAgent(plan, a.tier));
}

/**
 * Get locked agents (above current plan).
 */
export function getLockedAgents(plan: ElazyaPlan): AgentDef[] {
    return ALL_AGENTS.filter(a => !canAccessAgent(plan, a.tier));
}

/**
 * Check if user can activate another agent.
 */
export function canActivateAgent(plan: ElazyaPlan, currentActiveCount: number): boolean {
    return currentActiveCount < PLAN_LIMITS[plan].maxAgents;
}

/**
 * Get the upgrade plan suggestion.
 */
export function getUpgradeSuggestion(plan: ElazyaPlan): { nextPlan: ElazyaPlan; price: number; label: string; benefits: string } | null {
    if (plan === 'solo') return { nextPlan: 'pro', price: 300, label: 'Passer au Pro', benefits: '3 agents Pro + multi-machines' };
    if (plan === 'pro') return { nextPlan: 'business', price: 500, label: 'Passer au Business', benefits: '2 agents Business + machines illimitées' };
    return null;
}

/**
 * Get plan limits for a plan.
 */
export function getLimitsForPlan(plan: ElazyaPlan): PlanLimits {
    return PLAN_LIMITS[plan];
}
