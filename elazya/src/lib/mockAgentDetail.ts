/**
 * Mock data for Agent Detail pages.
 * Isolated here so real data can replace it in a later phase.
 */

export interface AgentAction {
    id: string;
    label: string;
    time: string;
    status: 'success' | 'error';
}

export interface AgentConfigField {
    id: string;
    label: string;
    type: 'text' | 'toggle' | 'select';
    placeholder?: string;
    value?: string;
    enabled?: boolean;
    options?: string[];
}

export interface AgentDetailData {
    features: string[];
    configFields: AgentConfigField[];
    recentActions: AgentAction[];
}

/**
 * Mock details keyed by agent ID (from plan-limits.ts ALL_AGENTS).
 */
export const AGENT_DETAILS: Record<string, AgentDetailData> = {
    'facturation': {
        features: [
            'Lit vos factures PDF et extrait les infos clés',
            'Crée un dossier par client automatiquement',
            'Ajoute la facture dans Notion avec les métadonnées',
            'Crée un rappel automatique avant l\'échéance',
        ],
        configFields: [
            { id: 'watch_dir', label: 'Dossier à surveiller', type: 'text', placeholder: '~/Documents/Factures', value: '' },
            { id: 'client_dir', label: 'Dossier clients', type: 'text', placeholder: '~/Clients', value: '' },
            { id: 'notion_sync', label: 'Synchroniser avec Notion', type: 'toggle', enabled: false },
            { id: 'notion_db', label: 'Base de données Notion', type: 'text', placeholder: 'ID de la base Notion', value: '', enabled: false },
        ],
        recentActions: [
            { id: '1', label: 'Facture Client Dupont classée', time: 'Aujourd\'hui 10:15', status: 'success' },
            { id: '2', label: 'Facture Martin archivée dans Notion', time: 'Aujourd\'hui 08:41', status: 'success' },
            { id: '3', label: 'Erreur : dossier clients introuvable', time: 'Hier 18:02', status: 'error' },
            { id: '4', label: 'Relance impayé Société ABC envoyée', time: 'Hier 14:30', status: 'success' },
            { id: '5', label: 'Facture Durand triée automatiquement', time: 'Hier 09:12', status: 'success' },
        ],
    },
    'onboarding-client': {
        features: [
            'Détecte les nouveaux emails de prospects',
            'Génère une réponse personnalisée en 5 minutes',
            'Crée un dossier client avec les infos clés',
            'Propose un créneau de rendez-vous automatiquement',
        ],
        configFields: [
            { id: 'email_account', label: 'Compte email à surveiller', type: 'text', placeholder: 'contact@monentreprise.com', value: '' },
            { id: 'response_tone', label: 'Ton des réponses', type: 'select', options: ['Professionnel', 'Amical', 'Formel'] },
            { id: 'auto_calendar', label: 'Proposer des créneaux auto', type: 'toggle', enabled: true },
        ],
        recentActions: [
            { id: '1', label: 'Réponse prospect Martin envoyée', time: 'Aujourd\'hui 07:12', status: 'success' },
            { id: '2', label: 'Dossier client Legrand créé', time: 'Hier 16:45', status: 'success' },
            { id: '3', label: 'Créneau proposé à prospect Morel', time: 'Hier 11:20', status: 'success' },
        ],
    },
    'linkedin-digest': {
        features: [
            'Analyse votre réseau et les tendances du jour',
            'Génère 1 post LinkedIn optimisé quotidien',
            'Crée 3 commentaires pertinents sur des posts clés',
            'Propose des hashtags et horaires de publication optimaux',
        ],
        configFields: [
            { id: 'linkedin_profile', label: 'Profil LinkedIn', type: 'text', placeholder: 'linkedin.com/in/votre-profil', value: '' },
            { id: 'post_tone', label: 'Ton des publications', type: 'select', options: ['Inspirant', 'Éducatif', 'Storytelling', 'Provocateur'] },
            { id: 'auto_publish', label: 'Publication automatique', type: 'toggle', enabled: false },
        ],
        recentActions: [
            { id: '1', label: '1 post + 3 commentaires générés', time: 'Aujourd\'hui 08:15', status: 'success' },
            { id: '2', label: 'Analyse tendances du jour terminée', time: 'Aujourd\'hui 07:00', status: 'success' },
            { id: '3', label: 'Post publié — 142 impressions', time: 'Hier 09:30', status: 'success' },
        ],
    },
    'qualification': {
        features: [
            'Analyse chaque nouveau lead entrant',
            'Score de qualification automatique (froid / tiède / chaud)',
            'Filtre les curieux des vrais prospects',
            'Alerte instantanée pour les leads chauds',
        ],
        configFields: [
            { id: 'crm_source', label: 'Source des leads', type: 'select', options: ['Formulaire web', 'Email', 'LinkedIn', 'Tous'] },
            { id: 'hot_threshold', label: 'Seuil lead chaud', type: 'select', options: ['70%', '80%', '90%'] },
            { id: 'auto_notify', label: 'Notification leads chauds', type: 'toggle', enabled: true },
        ],
        recentActions: [
            { id: '1', label: '12 leads triés · 3 qualifiés chauds', time: 'Aujourd\'hui 07:55', status: 'success' },
            { id: '2', label: 'Lead chaud détecté : Entreprise XYZ', time: 'Hier 15:10', status: 'success' },
        ],
    },
    'routine-matinale': {
        features: [
            'Compile les emails importants de la nuit',
            'Résume les tâches prioritaires du jour',
            'Prépare un briefing clair en 30 secondes',
            'Envoie le résumé à 7h30 chaque matin',
        ],
        configFields: [
            { id: 'send_time', label: 'Heure d\'envoi', type: 'text', placeholder: '07:30', value: '07:30' },
            { id: 'include_calendar', label: 'Inclure le calendrier', type: 'toggle', enabled: true },
            { id: 'include_emails', label: 'Inclure résumé emails', type: 'toggle', enabled: true },
        ],
        recentActions: [
            { id: '1', label: 'Briefing quotidien généré et envoyé', time: 'Aujourd\'hui 07:30', status: 'success' },
            { id: '2', label: 'Briefing quotidien généré', time: 'Hier 07:30', status: 'success' },
        ],
    },
    'crm-prospect': {
        features: [
            'Centralise tous vos prospects en un seul endroit',
            'Suivi automatique : relances, rappels, notes',
            'Aucun lead perdu grâce au tracking intelligent',
            'Historique complet de chaque interaction',
        ],
        configFields: [
            { id: 'crm_integration', label: 'CRM existant', type: 'select', options: ['Aucun', 'HubSpot', 'Pipedrive', 'Notion'] },
            { id: 'auto_followup', label: 'Relances automatiques', type: 'toggle', enabled: true },
            { id: 'followup_delay', label: 'Délai de relance (jours)', type: 'text', placeholder: '3', value: '3' },
        ],
        recentActions: [
            { id: '1', label: 'Relance automatique envoyée à 5 prospects', time: 'Aujourd\'hui 09:00', status: 'success' },
            { id: '2', label: '2 nouveaux prospects ajoutés au suivi', time: 'Hier 14:22', status: 'success' },
        ],
    },
    'devis-express': {
        features: [
            'Génère un devis professionnel en 10 minutes',
            'S\'adapte au contexte client automatiquement',
            'Template personnalisable avec votre charte',
            'Export PDF prêt à envoyer',
        ],
        configFields: [
            { id: 'company_name', label: 'Nom de l\'entreprise', type: 'text', placeholder: 'Mon Entreprise SAS', value: '' },
            { id: 'template', label: 'Template de devis', type: 'select', options: ['Standard', 'Premium', 'Minimaliste'] },
            { id: 'auto_numbering', label: 'Numérotation automatique', type: 'toggle', enabled: true },
        ],
        recentActions: [
            { id: '1', label: 'Devis #2024-047 généré pour Client Durand', time: 'Aujourd\'hui 11:15', status: 'success' },
            { id: '2', label: 'Devis #2024-046 envoyé au prospect Morel', time: 'Hier 16:30', status: 'success' },
        ],
    },
    'email-intelligent': {
        features: [
            'Trie votre inbox automatiquement',
            'Catégorise : urgent, à traiter, info, spam',
            'Génère des suggestions de réponse',
            'Archive le bruit, ne garde que l\'essentiel',
        ],
        configFields: [
            { id: 'email_account', label: 'Compte email', type: 'text', placeholder: 'nom@entreprise.com', value: '' },
            { id: 'auto_archive', label: 'Archiver les newsletters', type: 'toggle', enabled: true },
            { id: 'suggest_replies', label: 'Suggérer des réponses', type: 'toggle', enabled: true },
        ],
        recentActions: [
            { id: '1', label: '24 emails triés · 6 réponses suggérées', time: 'Hier 17:45', status: 'success' },
            { id: '2', label: '18 newsletters archivées', time: 'Hier 08:00', status: 'success' },
        ],
    },
    'compta-export': {
        features: [
            'Collecte toutes les factures du mois',
            'Génère un export comptable structuré',
            'Compatible avec les logiciels comptables courants',
            'Envoi automatique à votre comptable',
        ],
        configFields: [
            { id: 'export_format', label: 'Format d\'export', type: 'select', options: ['CSV', 'Excel', 'PDF'] },
            { id: 'accountant_email', label: 'Email du comptable', type: 'text', placeholder: 'comptable@cabinet.com', value: '' },
            { id: 'auto_send', label: 'Envoi automatique mensuel', type: 'toggle', enabled: false },
        ],
        recentActions: [
            { id: '1', label: 'Export mensuel février généré', time: 'Mar 01 09:00', status: 'success' },
            { id: '2', label: 'Export mensuel janvier envoyé', time: 'Fév 01 09:00', status: 'success' },
        ],
    },
    'content-linkedin': {
        features: [
            'Transforme 1 idée en 5 posts variés',
            'Adapte le ton : inspirant, éducatif, storytelling',
            'Optimise pour l\'algorithme LinkedIn',
            'Planifie la publication sur la semaine',
        ],
        configFields: [
            { id: 'content_pillars', label: 'Thèmes principaux', type: 'text', placeholder: 'IA, Productivité, Entrepreneuriat', value: '' },
            { id: 'posts_per_week', label: 'Posts par semaine', type: 'select', options: ['3', '5', '7'] },
            { id: 'include_visuals', label: 'Générer des visuels', type: 'toggle', enabled: false },
        ],
        recentActions: [
            { id: '1', label: '5 variations générées à partir de "IA et productivité"', time: 'Aujourd\'hui 06:00', status: 'success' },
            { id: '2', label: 'Post planifié pour lundi 09:00', time: 'Hier 18:00', status: 'success' },
        ],
    },
};

/**
 * Mock active agents (which agents are "on").
 * Keyed by agent ID → boolean.
 */
export const MOCK_AGENT_STATUS: Record<string, boolean> = {
    'facturation': true,
    'onboarding-client': true,
    'linkedin-digest': true,
    'qualification': true,
    'routine-matinale': false,
    'crm-prospect': false,
    'devis-express': false,
    'email-intelligent': false,
    'compta-export': false,
    'content-linkedin': false,
};

/**
 * Get detail data for an agent, with fallback.
 */
export function getAgentDetail(agentId: string): AgentDetailData {
    return AGENT_DETAILS[agentId] || {
        features: ['Configuration en cours...'],
        configFields: [],
        recentActions: [],
    };
}
