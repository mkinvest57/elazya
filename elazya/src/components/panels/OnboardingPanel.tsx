import { CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

const ONBOARDING_STEPS = [
    "Téléchargement et Installation Elazya",
    "Activation via Clé de Licence",
    "Lancement du Moteur Local (OpenClaw)",
    "Connexion API OpenAI / Anthropic",
    "Configuration du Bot Telegram",
    "Paramétrage du Canal Telegram",
    "Liaison du compte Notion CRM",
    "Liaison du compte LinkedIn",
    "Test du Morning Briefing",
    "Création du premier Agent Custom (No-Code)"
];

export default function OnboardingPanel() {
    const [completedSteps, setCompletedSteps] = useState<number[]>([0, 1]); // Exemples de steps complétés

    const toggleStep = (index: number) => {
        if (completedSteps.includes(index)) {
            setCompletedSteps(completedSteps.filter(i => i !== index));
        } else {
            setCompletedSteps([...completedSteps, index]);
        }
    };

    const progress = Math.round((completedSteps.length / ONBOARDING_STEPS.length) * 100);

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-semibold text-white">Bienvenue sur Elazya Studio</h2>
                <p className="text-neutral-400 mt-1">
                    Suivez ces 10 étapes pour configurer et déployer l'intégralité de votre écosystème multi-agents.
                </p>
            </div>

            <div className="bg-neutral-900/50 rounded-xl p-6 border border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-neutral-300">Progression globale</span>
                    <span className="text-sm font-bold text-white">{progress}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2.5">
                    <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="grid gap-3">
                {ONBOARDING_STEPS.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    return (
                        <div
                            key={index}
                            onClick={() => toggleStep(index)}
                            className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
                                    : 'bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800'
                                }`}
                        >
                            {isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                            ) : (
                                <Circle className="w-6 h-6 text-neutral-600 shrink-0" />
                            )}
                            <div className="flex-1">
                                <p className={`font-medium ${isCompleted ? 'text-emerald-400' : 'text-neutral-200'}`}>
                                    Étape {index + 1}
                                </p>
                                <p className="text-sm opacity-80">{step}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
