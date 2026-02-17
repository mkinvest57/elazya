import { useState, useEffect } from 'react';
import { OpenClawClient, ChannelStatus } from '@/lib/openclaw-client';
import { Radio, Power, PowerOff, Loader2, Check, ExternalLink, QrCode, Key, Bot, MessageSquare, HelpCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ToastProvider';

// Type definitions
interface ChannelField {
    id: string;
    label: string;
    placeholder: string;
    type: string;
    required: boolean;
    hint?: string;
}

interface ChannelConfig {
    name: string;
    icon: string;
    color: string;
    description: string;
    setupType: 'bot-token' | 'qr-code' | 'oauth' | 'linked-device' | 'login';
    setupTitle: string;
    setupSteps: string[];
    helpUrl?: string;
    fields?: ChannelField[];
    connectionCommand?: string;
}

// Channel-specific configuration info
const CHANNEL_CONFIG: Record<string, ChannelConfig> = {
    telegram: {
        name: 'Telegram',
        icon: '✈️',
        color: 'blue',
        description: 'Bot Telegram',
        setupType: 'bot-token',
        setupTitle: 'Configuration Telegram',
        setupSteps: [
            'Ouvrez Telegram et cherchez @BotFather',
            'Envoyez /newbot et suivez les instructions',
            'Copiez le token API fourni',
            'Collez-le ci-dessous'
        ],
        helpUrl: 'https://core.telegram.org/bots#how-do-i-create-a-bot',
        fields: [
            { id: 'token', label: 'Token du Bot', placeholder: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz', type: 'password', required: true },
            { id: 'userId', label: 'Votre User ID (pour allowlist)', placeholder: '7943150201', type: 'text', required: false, hint: 'Envoyez /start à @userinfobot pour le trouver' }
        ]
    },
    whatsapp: {
        name: 'WhatsApp',
        icon: '💬',
        color: 'green',
        description: 'Connexion via WhatsApp Web',
        setupType: 'qr-code',
        setupTitle: 'Connexion WhatsApp',
        setupSteps: [
            'Cliquez sur "Démarrer la connexion" ci-dessous',
            'Un QR code apparaîtra dans le terminal',
            'Scannez-le avec WhatsApp sur votre téléphone',
            'OpenClaw se connectera automatiquement'
        ],
        helpUrl: 'https://faq.whatsapp.com/1079327266110265',
        connectionCommand: 'openclaw channel whatsapp link'
    },
    discord: {
        name: 'Discord',
        icon: '🎮',
        color: 'purple',
        description: 'Bot Discord',
        setupType: 'bot-token',
        setupTitle: 'Configuration Discord',
        setupSteps: [
            'Allez sur discord.com/developers/applications',
            'Créez une nouvelle application',
            'Ajoutez un Bot dans l\'onglet "Bot"',
            'Copiez le token du bot'
        ],
        helpUrl: 'https://discord.com/developers/docs/getting-started',
        fields: [
            { id: 'token', label: 'Token du Bot', placeholder: 'MTIz...', type: 'password', required: true },
            { id: 'guildId', label: 'Serveur ID (optionnel)', placeholder: '1234567890', type: 'text', required: false }
        ]
    },
    slack: {
        name: 'Slack',
        icon: '💼',
        color: 'amber',
        description: 'App Slack',
        setupType: 'oauth',
        setupTitle: 'Configuration Slack',
        setupSteps: [
            'Allez sur api.slack.com/apps',
            'Créez une nouvelle App "From scratch"',
            'Activez les scopes : chat:write, im:read, im:write',
            'Installez l\'app dans votre workspace'
        ],
        helpUrl: 'https://api.slack.com/quickstart',
        fields: [
            { id: 'token', label: 'Bot User OAuth Token', placeholder: 'xoxb-...', type: 'password', required: true },
            { id: 'signingSecret', label: 'Signing Secret', placeholder: 'abc123...', type: 'password', required: false }
        ]
    },
    signal: {
        name: 'Signal',
        icon: '🔒',
        color: 'sky',
        description: 'Messagerie Signal',
        setupType: 'linked-device',
        setupTitle: 'Connexion Signal',
        setupSteps: [
            'OpenClaw utilise signal-cli pour se connecter',
            'La connexion se fait via appareil lié',
            'Cliquez "Démarrer" pour générer le QR code'
        ],
        connectionCommand: 'openclaw channel signal link'
    },
    matrix: {
        name: 'Matrix',
        icon: '🟩',
        color: 'fuchsia',
        description: 'Réseau Matrix/Element',
        setupType: 'login',
        setupTitle: 'Connexion Matrix',
        setupSteps: [
            'Entrez votre ID Matrix (@user:server.com)',
            'Et votre mot de passe ou access token'
        ],
        fields: [
            { id: 'userId', label: 'Matrix ID', placeholder: '@elazya:matrix.org', type: 'text', required: true },
            { id: 'token', label: 'Access Token ou Mot de passe', placeholder: 'syt_...', type: 'password', required: true }
        ]
    }
};

type ChannelId = keyof typeof CHANNEL_CONFIG;

function ChannelCard({
    channel,
    onConfigure,
    onToggle,
    loading
}: {
    channel: ChannelStatus & { config: typeof CHANNEL_CONFIG[ChannelId] };
    onConfigure: () => void;
    onToggle: () => void;
    loading: boolean;
}) {
    const isConnected = channel.connected || channel.active;
    const config = channel.config;

    return (
        <div className={`p-5 rounded-xl border transition-all duration-300 ${isConnected
            ? `bg-gradient-to-br from-${config.color}-500/10 to-transparent border-${config.color}-500/30`
            : 'bg-white/5 border-white/5 hover:border-white/10'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div>
                        <h4 className="font-bold text-white">{config.name}</h4>
                        <p className="text-xs text-zinc-500">{config.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Setup type indicator */}
                    <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-zinc-500">
                        {config.setupType === 'qr-code' && '📱 QR Code'}
                        {config.setupType === 'bot-token' && '🤖 Bot Token'}
                        {config.setupType === 'oauth' && '🔐 OAuth'}
                        {config.setupType === 'linked-device' && '📱 Appareil lié'}
                        {config.setupType === 'login' && '🔑 Login'}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${isConnected
                        ? `bg-${config.color}-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]`
                        : 'bg-zinc-600'
                        }`} />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onConfigure}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-zinc-400 hover:text-white hover:border-white/20 transition-colors"
                >
                    {config.setupType === 'qr-code' ? (
                        <QrCode className="w-4 h-4" />
                    ) : config.setupType === 'bot-token' ? (
                        <Bot className="w-4 h-4" />
                    ) : (
                        <Key className="w-4 h-4" />
                    )}
                    {isConnected ? 'Reconfigurer' : 'Configurer'}
                </button>
                {channel.configured && (
                    <button
                        onClick={onToggle}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${isConnected
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isConnected ? (
                            <PowerOff className="w-4 h-4" />
                        ) : (
                            <Power className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

// Platform-specific configuration modal content
function ConfigModalContent({
    channelId,
    formData,
    setFormData,
    onSubmit,
    loading,
    onStartQrLink
}: {
    channelId: ChannelId;
    formData: Record<string, string>;
    setFormData: (data: Record<string, string>) => void;
    onSubmit: () => void;
    loading: boolean;
    onStartQrLink: () => void;
}) {
    const config = CHANNEL_CONFIG[channelId];

    if (!config) return null;

    // QR Code based setup (WhatsApp, Signal)
    if (config.setupType === 'qr-code' || config.setupType === 'linked-device') {
        return (
            <div className="space-y-4">
                <div className={`bg-${config.color}-500/10 border border-${config.color}-500/20 rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                        <QrCode className={`w-6 h-6 text-${config.color}-400 flex-shrink-0 mt-0.5`} />
                        <div>
                            <h4 className="font-bold text-white mb-2">Connexion par QR Code</h4>
                            <p className="text-sm text-zinc-400">
                                OpenClaw gère la connexion {config.name} automatiquement via son système intégré.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 space-y-3">
                    <h5 className="text-sm font-bold text-zinc-300">Étapes :</h5>
                    <ol className="space-y-2">
                        {config.setupSteps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white flex-shrink-0">
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ol>
                </div>

                <button
                    onClick={onStartQrLink}
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-xl bg-${config.color}-500 text-black font-bold hover:bg-${config.color}-400 transition-colors disabled:opacity-50`}
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <QrCode className="w-5 h-5" />
                    )}
                    Démarrer la connexion
                </button>

                <p className="text-xs text-zinc-600 text-center">
                    Le QR code s'affichera dans le terminal OpenClaw
                </p>
            </div>
        );
    }

    // Token/OAuth based setup
    return (
        <div className="space-y-4">
            {/* Setup steps */}
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
                <h5 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Comment obtenir les identifiants ?
                </h5>
                <ol className="space-y-2">
                    {config.setupSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-zinc-400">
                            <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-white flex-shrink-0">
                                {i + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
                {config.helpUrl && (
                    <a
                        href={config.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-indigo-400 hover:underline"
                    >
                        <ExternalLink className="w-3 h-3" />
                        Documentation officielle
                    </a>
                )}
            </div>

            {/* Dynamic fields */}
            {config.fields?.map(field => (
                <div key={field.id}>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 font-mono text-sm"
                    />
                    {field.hint && (
                        <p className="text-xs text-zinc-500 mt-1">{field.hint}</p>
                    )}
                </div>
            ))}

            {/* DM Policy for bots */}
            {(config.setupType === 'bot-token') && (
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Politique DM</label>
                    <select
                        value={formData.dmPolicy || 'allowlist'}
                        onChange={(e) => setFormData({ ...formData, dmPolicy: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-indigo-500/50"
                    >
                        <option value="allowlist">Liste blanche (sécurisé)</option>
                        <option value="pairing">Code de jumelage</option>
                        <option value="open">Ouvert (⚠️ non recommandé)</option>
                    </select>
                </div>
            )}

            <button
                onClick={onSubmit}
                disabled={loading || !config.fields?.every(f => !f.required || formData[f.id])}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Check className="w-4 h-4" />
                )}
                Enregistrer
            </button>
        </div>
    );
}

export default function ChannelsPanel() {
    const [channels, setChannels] = useState<ChannelStatus[]>([]);
    const [configChannel, setConfigChannel] = useState<ChannelId | null>(null);
    const [loadingChannel, setLoadingChannel] = useState<string | null>(null);
    const [formData, setFormData] = useState<Record<string, string>>({});
    const { showToast } = useToast();

    const fetchChannels = async () => {
        const data = await OpenClawClient.getChannelsStatus();
        setChannels(data);
    };

    useEffect(() => {
        fetchChannels();
        const interval = setInterval(fetchChannels, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleToggle = async (channelId: string) => {
        const channel = channels.find(c => c.id === channelId);
        if (!channel) return;

        const isActive = channel.connected || channel.active;
        setLoadingChannel(channelId);

        try {
            await OpenClawClient.toggleChannel(channelId, !isActive);
            showToast(`${channelId} ${isActive ? 'déconnecté' : 'connecté'}`, 'success');
            await fetchChannels();
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoadingChannel(null);
        }
    };

    const handleConfigure = async () => {
        if (!configChannel) return;

        setLoadingChannel(configChannel);
        try {
            await OpenClawClient.enableChannel(
                configChannel,
                formData.token || '',
                formData.userId || undefined,
                formData.dmPolicy || 'allowlist'
            );
            showToast(`${CHANNEL_CONFIG[configChannel].name} configuré avec succès`, 'success');
            setConfigChannel(null);
            setFormData({});
            await fetchChannels();
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoadingChannel(null);
        }
    };

    const handleStartQrLink = async () => {
        if (!configChannel) return;

        const config = CHANNEL_CONFIG[configChannel];
        setLoadingChannel(configChannel);

        try {
            // For QR-based channels, OpenClaw handles the linking process
            showToast(`Démarrage de la connexion ${config.name}... Vérifiez le terminal.`, 'info');

            // This would trigger OpenClaw's channel linking process
            await OpenClawClient.enableChannel(configChannel, 'qr-link', undefined, 'allowlist');

            await fetchChannels();
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoadingChannel(null);
        }
    };

    // Merge with static config
    const enrichedChannels = Object.keys(CHANNEL_CONFIG).map(id => {
        const channelId = id as ChannelId;
        const channel = channels.find(c => c.id === id);
        return {
            id: channelId,
            name: CHANNEL_CONFIG[channelId].name,
            configured: channel?.configured ?? false,
            active: channel?.active ?? false,
            connected: channel?.connected ?? false,
            config: CHANNEL_CONFIG[channelId]
        };
    });

    const connectedCount = enrichedChannels.filter(c => c.connected || c.active).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Radio className="w-6 h-6 text-purple-400" />
                    Canaux de Communication
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    {connectedCount} canal{connectedCount !== 1 ? 'x' : ''} connecté{connectedCount !== 1 ? 's' : ''} sur {Object.keys(CHANNEL_CONFIG).length}
                </p>
            </div>

            {/* Info banner */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-300">
                    <strong>OpenClaw gère les connexions.</strong> Chaque canal a sa propre méthode :
                    QR code pour WhatsApp/Signal, Bot Token pour Telegram/Discord, OAuth pour Slack.
                </div>
            </div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrichedChannels.map(channel => (
                    <ChannelCard
                        key={channel.id}
                        channel={channel}
                        onConfigure={() => {
                            setConfigChannel(channel.id);
                            setFormData({});
                        }}
                        onToggle={() => handleToggle(channel.id)}
                        loading={loadingChannel === channel.id}
                    />
                ))}
            </div>

            {/* Configure Modal */}
            <Modal
                isOpen={!!configChannel}
                onClose={() => setConfigChannel(null)}
                title={configChannel ? CHANNEL_CONFIG[configChannel]?.setupTitle : ''}
                size="md"
            >
                {configChannel && (
                    <ConfigModalContent
                        channelId={configChannel}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleConfigure}
                        loading={loadingChannel === configChannel}
                        onStartQrLink={handleStartQrLink}
                    />
                )}
            </Modal>
        </div>
    );
}
