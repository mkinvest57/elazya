import { useState, useEffect } from 'react';
import { OpenClawClient } from '@/lib/openclaw-client';
import { HardDrive, Download, Trash2, Search, Loader2, Info, Command, BookOpen } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ToastProvider';

// Enhanced Skill Interface
interface SkillDef {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'productivity' | 'social' | 'media' | 'dev' | 'iot';
    longDescription: string;
    examples: string[];
    requirements?: string;
}

const AVAILABLE_SKILLS: SkillDef[] = [
    // Productivity
    {
        id: 'himalaya', name: 'Email', description: 'Gérer vos emails', icon: '✉️', category: 'productivity',
        longDescription: "Permet à Elazya de lire, rédiger et envoyer des emails via votre compte configuré.",
        examples: ["Lis mes derniers mails", "Envoie un mail à Jean pour dire que j'arrive"],
        requirements: "Nécessite une configuration IMAP/SMTP locale (Himalaya CLI)."
    },
    {
        id: 'notion', name: 'Notion', description: 'Synchroniser avec Notion', icon: '📓', category: 'productivity',
        longDescription: "Créez des pages, lisez vos notes et gérez vos bases de données Notion directement depuis le chat.",
        examples: ["Ajoute une task 'Acheter du lait' dans ma to-do", "Résume ma page de notes sur le projet X"],
        requirements: "Clé API Notion requise dans Config > Clés Supplémentaires."
    },
    {
        id: 'apple-reminders', name: 'Rappels', description: 'Rappels Apple', icon: '📌', category: 'productivity',
        longDescription: "Intégration native avec l'application Rappels de macOS.",
        examples: ["Rappelle-moi de sortir les poubelles ce soir à 20h", "Quels sont mes rappels aujourd'hui ?"],
        requirements: "macOS uniquement. Demande la permission d'accès aux Rappels."
    },
    {
        id: 'obsidian', name: 'Obsidian', description: 'Notes Obsidian', icon: '💎', category: 'productivity',
        longDescription: "Gestion de votre 'Second Cerveau'. Crée et modifie des notes Markdown dans votre vault.",
        examples: ["Crée une note 'Idées' avec ce contenu...", "Cherche dans mes notes Obsidian"],
        requirements: "Nécessite le plugin 'Local REST API' dans Obsidian."
    },
    {
        id: 'trello', name: 'Trello', description: 'Gérer vos boards', icon: '📋', category: 'productivity',
        longDescription: "Gestion de projet agile. Déplacez des cartes et gérez vos colonnes.",
        examples: ["Déplace la carte 'Bug #12' dans Done", "Crée une liste 'Idées'"],
        requirements: "Clé API Trello & Token."
    },
    {
        id: '1password', name: '1Password', description: 'Mots de passe', icon: '🔐', category: 'productivity',
        longDescription: "Accès sécurisé à vos items (lecture seule recommandée) pour récupérer des infos.",
        examples: ["Cherche les infos du serveur 'Prod'", "Récupère le mot de passe Wifi"],
        requirements: "CLI 1Password installé et authentifié."
    },

    // Social
    {
        id: 'discord', name: 'Discord', description: 'Intégration Discord', icon: '🎮', category: 'social',
        longDescription: "Un bot complet pour votre serveur. Modération, musique, ou juste discuter.",
        examples: ["Ban l'utilisateur @troll", "Joue de la musique dans le vocal"],
        requirements: "Token de Bot Discord requis."
    },
    {
        id: 'slack', name: 'Slack', description: 'Messages Slack', icon: '💼', category: 'social',
        longDescription: "Assistant de travail pour Slack. Résume des fils de discussion et envoie des messages.",
        examples: ["Envoie un message sur #general", "Résume la discussion du channel #marketing"],
        requirements: "Token Bot Slack (Socket Mode)."
    },

    // Media
    {
        id: 'spotify-player', name: 'Spotify', description: 'Contrôle musical', icon: '🎵', category: 'media',
        longDescription: "Le DJ personnel. Lancez des playlists, contrôlez le volume et découvrez des titres.",
        examples: ["Joue ma playlist 'Focus'", "Mets le volume à 50%", "C'est quoi cette chanson ?"],
        requirements: "Spotify Premium requis pour le contrôle complet."
    },
    {
        id: 'sonoscli', name: 'Sonos', description: 'Contrôler Sonos', icon: '🔊', category: 'media',
        longDescription: "Contrôle multi-room de votre système Sonos.",
        examples: ["Joue de la musique dans le salon", "Groupe la cuisine et le salon"],
        requirements: "Système Sonos sur le même réseau Wifi."
    },
    {
        id: 'camsnap', name: 'Webcam', description: 'Capture photo', icon: '📷', category: 'media',
        longDescription: "Prend des photos avec votre webcam pour que l'IA puisse 'voir' ce qui se passe.",
        examples: ["Prends une photo", "Regarde ce que je te montre"],
        requirements: "Webcam fonctionnelle."
    },

    // Utilities / Dev
    {
        id: 'web-search', name: 'Recherche Web', description: 'Accès Internet', icon: '🔍', category: 'dev',
        longDescription: "Donne accès à Google/Bing à l'IA pour des informations en temps réel.",
        examples: ["Qui a gagné le match hier ?", "Cherche des recettes de lasagnes"],
        requirements: "Clé API Google Search ou Bing (Config)."
    },
    {
        id: 'weather', name: 'Météo', description: 'Prévisions météo', icon: '🌤️', category: 'dev',
        longDescription: "Données météorologiques précises partout dans le monde.",
        examples: ["Il fait quel temps à Tokyo ?", "Va-t-il pleuvoir demain ?"],
        requirements: "Aucune (API publique OpenMeteo)."
    },
    {
        id: 'github', name: 'GitHub', description: 'Gérer vos repos', icon: '🐙', category: 'dev',
        longDescription: "Pilotez vos développements. Issues, PRs, et exploration de code.",
        examples: ["Liste mes PRs ouvertes", "Crée une issue 'Bug fix' sur le repo 'App'"],
        requirements: "Token GitHub (PAT) avec droits repo."
    },
    {
        id: 'openhue', name: 'Philips Hue', description: 'Domotique éclairage', icon: '💡', category: 'iot',
        longDescription: "Contrôle total de vos lumières Philips Hue.",
        examples: ["Allume le salon en rouge", "Mode cinéma", "Éteins tout"],
        requirements: "Bridge Hue sur le réseau local."
    },
];

const CATEGORIES = [
    { id: 'all', label: 'Tout' },
    { id: 'productivity', label: 'Productivité' },
    { id: 'social', label: 'Social' },
    { id: 'media', label: 'Média' },
    { id: 'dev', label: 'Utilitaires' },
    { id: 'iot', label: 'Maison' },
];

function SkillDetailsModal({ skill, isOpen, onClose, installed, onInstall, onUninstall, loading }: {
    skill: SkillDef;
    isOpen: boolean;
    onClose: () => void;
    installed: boolean;
    onInstall: () => void;
    onUninstall: () => void;
    loading: boolean;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={skill.name} size="md">
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="text-4xl bg-white/5 p-4 rounded-2xl">{skill.icon}</div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{skill.name}</h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
                            Category: {skill.category}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 font-bold text-white mb-2">
                            <BookOpen className="w-4 h-4 text-zinc-400" />
                            Description
                        </h4>
                        <p className="text-zinc-300 text-sm leading-relaxed">{skill.longDescription}</p>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="flex items-center gap-2 font-bold text-white mb-2">
                            <Command className="w-4 h-4 text-zinc-400" />
                            Exemples
                        </h4>
                        <ul className="space-y-2">
                            {skill.examples.map((ex, i) => (
                                <li key={i} className="text-sm text-zinc-400 font-mono bg-black/20 px-3 py-2 rounded-lg border border-white/5 flex items-center gap-2">
                                    <span className="text-indigo-500/50">ls</span>
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {skill.requirements && (
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20">
                            <h4 className="flex items-center gap-2 font-bold text-amber-400 mb-1 text-sm">
                                <Info className="w-4 h-4" />
                                Pré-requis
                            </h4>
                            <p className="text-amber-200/80 text-xs">{skill.requirements}</p>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors">
                        Fermer
                    </button>
                    <button
                        onClick={() => {
                            if (installed) onUninstall();
                            else onInstall();
                        }}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 py-2 rounded-xl font-bold transition-all ${installed
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                            : 'bg-indigo-500 text-white hover:bg-indigo-400 border border-transparent hover:scale-105'
                            } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : installed ? <Trash2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        {installed ? 'Désinstaller' : 'Installer le Skill'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function SkillCard({ skill, installed, onInstall, onUninstall, loading }: {
    skill: SkillDef;
    installed: boolean;
    onInstall: () => void;
    onUninstall: () => void;
    loading: boolean;
}) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <div
                onClick={() => setShowDetails(true)}
                className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer relative overflow-hidden ${installed
                    ? 'bg-green-500/5 border-green-500/30 hover:bg-green-500/10'
                    : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{skill.icon}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{skill.name}</h4>
                            {installed && (
                                <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase">
                                    Installé
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{skill.description}</p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        {skill.category}
                    </span>
                    <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                        Détails <Info className="w-3 h-3" />
                    </span>
                </div>
            </div>

            <SkillDetailsModal
                skill={skill}
                isOpen={showDetails}
                onClose={() => setShowDetails(false)}
                installed={installed}
                onInstall={onInstall}
                onUninstall={onUninstall}
                loading={loading}
            />
        </>
    );
}

export default function SkillsPanel() {
    const [installedSkills, setInstalledSkills] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
    const { showToast } = useToast();

    const fetchSkills = async () => {
        try {
            const skills = await OpenClawClient.getInstalledSkills();
            setInstalledSkills(skills);
        } catch (e) {
            console.error("Failed to fetch skills", e);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const handleInstall = async (skillId: string) => {
        setLoadingSkill(skillId);
        try {
            await OpenClawClient.installSkill(skillId);
            showToast(`${skillId} installé avec succès`, 'success');
            await fetchSkills();
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoadingSkill(null);
        }
    };

    const handleUninstall = async (skillId: string) => {
        if (!confirm(`Voulez-vous vraiment désinstaller ${skillId} ?`)) return;

        setLoadingSkill(skillId);
        try {
            await OpenClawClient.uninstallSkill(skillId);
            showToast(`${skillId} désinstallé avec succès`, 'success');
            await fetchSkills();
        } catch (err) {
            showToast(`Erreur: ${err}`, 'error');
        } finally {
            setLoadingSkill(null);
        }
    };

    const isInstalled = (skillId: string) => {
        return installedSkills.some(s => s.toLowerCase().includes(skillId.toLowerCase()));
    };

    const filteredSkills = AVAILABLE_SKILLS.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const installedCount = AVAILABLE_SKILLS.filter(s => isInstalled(s.id)).length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HardDrive className="w-6 h-6 text-indigo-400" />
                    Catalogue de Compétences
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                    Ajoutez des super-pouvoirs à votre IA. {installedCount} skills installés.
                </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Rechercher (Spotify, Notion...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map(skill => (
                    <SkillCard
                        key={skill.id}
                        skill={skill}
                        installed={isInstalled(skill.id)}
                        onInstall={() => handleInstall(skill.id)}
                        onUninstall={() => handleUninstall(skill.id)}
                        loading={loadingSkill === skill.id}
                    />
                ))}
            </div>

            {filteredSkills.length === 0 && (
                <div className="text-center py-12 text-zinc-500 border border-white/5 rounded-xl bg-white/5 border-dashed">
                    <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun skill ne correspond à votre recherche.</p>
                </div>
            )}
        </div>
    );
}
