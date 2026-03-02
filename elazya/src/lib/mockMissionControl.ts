/**
 * Mock data for Mission Control dashboard.
 * Isolated here so real data can replace it in Phase 2.
 */

export interface ActivityEntry {
    id: string;
    agentName: string;
    agentEmoji: string;
    action: string;
    time: string;          // "HH:mm"
    status: 'success' | 'error' | 'running';
}

export interface SystemHealth {
    agentsOk: number;
    agentsTotal: number;
    recentErrors: number;
    pendingTasks: number;
}

export interface MissionControlData {
    activeAgents: number;
    maxAgents: number;
    timeSavedMonthly: number;   // hours
    timeSavedWeekly: number;    // hours
    health: SystemHealth;
    recentActivity: ActivityEntry[];
}

export const MOCK_DATA: MissionControlData = {
    activeAgents: 4,
    maxAgents: 8,
    timeSavedMonthly: 32,
    timeSavedWeekly: 8,
    health: {
        agentsOk: 4,
        agentsTotal: 4,
        recentErrors: 0,
        pendingTasks: 2,
    },
    recentActivity: [
        {
            id: '1',
            agentName: 'Facturation Auto',
            agentEmoji: '💰',
            action: 'Facture Client Dupont classée et archivée',
            time: '08:41',
            status: 'success',
        },
        {
            id: '2',
            agentName: 'LinkedIn Digest',
            agentEmoji: '📱',
            action: '1 post + 3 commentaires générés',
            time: '08:15',
            status: 'success',
        },
        {
            id: '3',
            agentName: 'Qualification Leads',
            agentEmoji: '🎯',
            action: '12 leads triés · 3 qualifiés',
            time: '07:55',
            status: 'success',
        },
        {
            id: '4',
            agentName: 'Routine Matinale',
            agentEmoji: '🏃',
            action: 'Briefing quotidien généré',
            time: '07:30',
            status: 'success',
        },
        {
            id: '5',
            agentName: 'Onboarding Client',
            agentEmoji: '📧',
            action: 'Réponse prospect Martin envoyée',
            time: '07:12',
            status: 'success',
        },
        {
            id: '6',
            agentName: 'Facturation Auto',
            agentEmoji: '💰',
            action: 'Relance impayé Société ABC',
            time: 'Hier 18:20',
            status: 'error',
        },
        {
            id: '7',
            agentName: 'Email Intelligent',
            agentEmoji: '💼',
            action: '24 emails triés · 6 réponses suggérées',
            time: 'Hier 17:45',
            status: 'success',
        },
    ],
};
