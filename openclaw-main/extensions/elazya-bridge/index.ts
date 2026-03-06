import { exec } from "node:child_process";
import { promisify } from "node:util";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk";

const execAsync = promisify(exec);

const plugin = {
    id: "elazya-bridge",
    name: "Elazya Bridge",
    description: "Bridge to Elazya Mac App CLI",
    register(api: OpenClawPluginApi) {
        api.registerTool({
            name: "run_elazya_agent",
            description: "Exécute un agent Elazya spécifique sur le Mac. IDs valides: routine-matinale, facturation, qualification, linkedin-digest, onboarding-client.",
            parameters: {
                type: "object",
                properties: {
                    agentId: {
                        type: "string",
                        description: "L'ID de l'agent à exécuter (ex: 'routine-matinale')"
                    }
                },
                required: ["agentId"]
            },
            handler: async (args: { agentId: string }) => {
                api.logger.info(`Exécution de l'agent Elazya: ${args.agentId}`);

                // Validate agent ID to avoid shell injection (even if it's internal)
                const validIds = [
                    "routine-matinale",
                    "facturation",
                    "qualification",
                    "linkedin-digest",
                    "onboarding-client"
                ];

                if (!validIds.includes(args.agentId)) {
                    return {
                        isError: true,
                        content: [{ type: "text", text: `Erreur: ID d'agent invalide '${args.agentId}'.` }]
                    };
                }

                try {
                    // Exécute l'agent via la CLI d'Elazya
                    // On utilise le chemin absolu vers le binaire dans le dossier d'application
                    const command = `/Applications/Elazya.app/Contents/MacOS/elazya test-agent ${args.agentId} --source telegram`;

                    api.logger.debug(`Commande CLI: ${command}`);

                    const { stdout, stderr } = await execAsync(command);

                    if (stderr) {
                        api.logger.warn(`Elazya CLI stderr: ${stderr}`);
                    }

                    // On cherche le marqueur [CLI RESULT] dans la sortie
                    const marker = "[CLI RESULT]";
                    const markerIndex = stdout.indexOf(marker);

                    if (markerIndex !== -1) {
                        const jsonStr = stdout.slice(markerIndex + marker.length).trim();
                        try {
                            const result = JSON.parse(jsonStr);
                            // On renvoie le résumé s'il existe, sinon le JSON complet
                            return {
                                content: [{
                                    type: "text",
                                    text: result.summary || "Agent exécuté avec succès."
                                }],
                                details: result
                            };
                        } catch (e) {
                            api.logger.error(`Erreur de parsing JSON du résultat CLI: ${e}`);
                        }
                    }

                    return {
                        content: [{ type: "text", text: stdout || "Agent exécuté." }]
                    };
                } catch (error) {
                    api.logger.error(`Échec de l'exécution de l'agent Elazya: ${error}`);
                    return {
                        isError: true,
                        content: [{ type: "text", text: "⚠️ Désolé, une erreur est survenue lors de l'exécution de l'agent sur le Mac." }]
                    };
                }
            }
        });
    },
};

export default plugin;
