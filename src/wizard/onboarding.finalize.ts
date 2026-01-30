import fs from "node:fs/promises";
import path from "node:path";

import { DEFAULT_BOOTSTRAP_FILENAME } from "../agents/workspace.js";
import {
  DEFAULT_GATEWAY_DAEMON_RUNTIME,
  GATEWAY_DAEMON_RUNTIME_OPTIONS,
  type GatewayDaemonRuntime,
} from "../commands/daemon-runtime.js";
import { healthCommand } from "../commands/health.js";
import { formatHealthCheckFailure } from "../commands/health-format.js";
import {
  detectBrowserOpenSupport,
  formatControlUiSshHint,
  openUrl,
  openUrlInBackground,
  probeGatewayReachable,
  waitForGatewayReachable,
  resolveControlUiLinks,
} from "../commands/onboard-helpers.js";
import { formatCliCommand } from "../cli/command-format.js";
import type { OnboardOptions } from "../commands/onboard-types.js";
import type { AlizeConfig } from "../config/config.js";
import { resolveGatewayService } from "../daemon/service.js";
import { isSystemdUserServiceAvailable } from "../daemon/systemd.js";
import { ensureControlUiAssetsBuilt } from "../infra/control-ui-assets.js";
import type { RuntimeEnv } from "../runtime.js";
import { runTui } from "../tui/tui.js";
import { resolveUserPath } from "../utils.js";
import {
  buildGatewayInstallPlan,
  gatewayInstallErrorHint,
} from "../commands/daemon-install-helpers.js";
import type { GatewayWizardSettings, WizardFlow } from "./onboarding.types.js";
import type { WizardPrompter } from "./prompts.js";

type FinalizeOnboardingOptions = {
  flow: WizardFlow;
  opts: OnboardOptions;
  baseConfig: AlizeConfig;
  nextConfig: AlizeConfig;
  workspaceDir: string;
  settings: GatewayWizardSettings;
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
};

export async function finalizeOnboardingWizard(options: FinalizeOnboardingOptions) {
  const { flow, opts, baseConfig, nextConfig, settings, prompter, runtime } = options;

  const withWizardProgress = async <T>(
    label: string,
    options: { doneMessage?: string },
    work: (progress: { update: (message: string) => void }) => Promise<T>,
  ): Promise<T> => {
    const progress = prompter.progress(label);
    try {
      return await work(progress);
    } finally {
      progress.stop(options.doneMessage);
    }
  };

  const systemdAvailable =
    process.platform === "linux" ? await isSystemdUserServiceAvailable() : true;
  if (process.platform === "linux" && !systemdAvailable) {
    await prompter.note(
      "Les services utilisateur Systemd ne sont pas disponibles. Passage des vérifications de persistance et de l'installation du service.",
      "Systemd",
    );
  }

  if (process.platform === "linux" && systemdAvailable) {
    const { ensureSystemdUserLingerInteractive } = await import("../commands/systemd-linger.js");
    await ensureSystemdUserLingerInteractive({
      runtime,
      prompter: {
        confirm: prompter.confirm,
        note: prompter.note,
      },
      reason:
        "Linux installs use a systemd user service by default. Without lingering, systemd stops the user session on logout/idle and kills the Gateway.",
      requireConfirm: false,
    });
  }

  const explicitInstallDaemon =
    typeof opts.installDaemon === "boolean" ? opts.installDaemon : undefined;
  let installDaemon: boolean;
  if (explicitInstallDaemon !== undefined) {
    installDaemon = explicitInstallDaemon;
  } else if (process.platform === "linux" && !systemdAvailable) {
    installDaemon = false;
  } else if (flow === "quickstart") {
    installDaemon = true;
  } else {
    installDaemon = await prompter.confirm({
      message: "Installer le service de la passerelle (recommandé)",
      initialValue: true,
    });
  }

  if (process.platform === "linux" && !systemdAvailable && installDaemon) {
    await prompter.note(
      "Services Systemd indisponibles ; installation du service ignorée. Utilisez votre superviseur de conteneur ou `docker compose up -d`.",
      "Service Gateway",
    );
    installDaemon = false;
  }

  if (installDaemon) {
    const daemonRuntime =
      flow === "quickstart"
        ? (DEFAULT_GATEWAY_DAEMON_RUNTIME as GatewayDaemonRuntime)
        : ((await prompter.select({
            message: "Environnement d'exécution (Runtime)",
            options: GATEWAY_DAEMON_RUNTIME_OPTIONS,
            initialValue: opts.daemonRuntime ?? DEFAULT_GATEWAY_DAEMON_RUNTIME,
          })) as GatewayDaemonRuntime);
    if (flow === "quickstart") {
      await prompter.note(
        "Le mode QuickStart utilise Node pour le service (stable + supporté).",
        "Environnement d'exécution",
      );
    }
    const service = resolveGatewayService();
    const loaded = await service.isLoaded({ env: process.env });
    if (loaded) {
      const action = (await prompter.select({
        message: "Le service Gateway est déjà installé",
        options: [
          { value: "restart", label: "Redémarrer" },
          { value: "reinstall", label: "Réinstaller" },
          { value: "skip", label: "Passer" },
        ],
      })) as "restart" | "reinstall" | "skip";
      if (action === "restart") {
        await withWizardProgress(
          "Service Gateway",
          { doneMessage: "Service Gateway redémarré." },
          async (progress) => {
            progress.update("Redémarrage du service Gateway…");
            await service.restart({
              env: process.env,
              stdout: process.stdout,
            });
          },
        );
      } else if (action === "reinstall") {
        await withWizardProgress(
          "Service Gateway",
          { doneMessage: "Service Gateway désinstallé." },
          async (progress) => {
            progress.update("Désinstallation du service Gateway…");
            await service.uninstall({ env: process.env, stdout: process.stdout });
          },
        );
      }
    }

    if (!loaded || (loaded && (await service.isLoaded({ env: process.env })) === false)) {
      const progress = prompter.progress("Service Gateway");
      let installError: string | null = null;
      try {
        progress.update("Préparation du service Gateway…");
        const { programArguments, workingDirectory, environment } = await buildGatewayInstallPlan({
          env: process.env,
          port: settings.port,
          token: settings.gatewayToken,
          runtime: daemonRuntime,
          warn: (message, title) => prompter.note(message, title),
          config: nextConfig,
        });

        progress.update("Installation du service Gateway…");
        await service.install({
          env: process.env,
          stdout: process.stdout,
          programArguments,
          workingDirectory,
          environment,
        });
      } catch (err) {
        installError = err instanceof Error ? err.message : String(err);
      } finally {
        progress.stop(
          installError ? "Échec de l'installation du service." : "Service Gateway installé.",
        );
      }
      if (installError) {
        await prompter.note(`Gateway service install failed: ${installError}`, "Gateway");
        await prompter.note(gatewayInstallErrorHint(), "Gateway");
      }
    }
  }

  if (!opts.skipHealth) {
    const probeLinks = resolveControlUiLinks({
      bind: nextConfig.gateway?.bind ?? "loopback",
      port: settings.port,
      customBindHost: nextConfig.gateway?.customBindHost,
      basePath: undefined,
    });
    // Daemon install/restart can briefly flap the WS; wait a bit so health check doesn't false-fail.
    await waitForGatewayReachable({
      url: probeLinks.wsUrl,
      token: settings.gatewayToken,
      deadlineMs: 15_000,
    });
    try {
      await healthCommand({ json: false, timeoutMs: 10_000 }, runtime);
    } catch (err) {
      runtime.error(formatHealthCheckFailure(err));
      await prompter.note(
        [
          "Docs :",
          "https://docs.molt.bot/gateway/health",
          "https://docs.molt.bot/gateway/troubleshooting",
        ].join("\n"),
        "Aide au diagnostic",
      );
    }
  }

  const controlUiEnabled =
    nextConfig.gateway?.controlUi?.enabled ?? baseConfig.gateway?.controlUi?.enabled ?? true;
  if (!opts.skipUi && controlUiEnabled) {
    const controlUiAssets = await ensureControlUiAssetsBuilt(runtime);
    if (!controlUiAssets.ok && controlUiAssets.message) {
      runtime.error(controlUiAssets.message);
    }
  }

  await prompter.note(
    [
      "Ajoutez des compagnons pour plus de fonctionnalités :",
      "- App macOS (système + notifications)",
      "- App iOS (caméra/dessin)",
      "- App Android (caméra/dessin)",
    ].join("\n"),
    "Applications optionnelles",
  );

  const controlUiBasePath =
    nextConfig.gateway?.controlUi?.basePath ?? baseConfig.gateway?.controlUi?.basePath;
  const links = resolveControlUiLinks({
    bind: settings.bind,
    port: settings.port,
    customBindHost: settings.customBindHost,
    basePath: controlUiBasePath,
  });
  const tokenParam =
    settings.authMode === "token" && settings.gatewayToken
      ? `?token=${encodeURIComponent(settings.gatewayToken)}`
      : "";
  const authedUrl = `${links.httpUrl}${tokenParam}`;
  const gatewayProbe = await probeGatewayReachable({
    url: links.wsUrl,
    token: settings.authMode === "token" ? settings.gatewayToken : undefined,
    password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
  });
  const gatewayStatusLine = gatewayProbe.ok
    ? "Gateway: reachable"
    : `Gateway: not detected${gatewayProbe.detail ? ` (${gatewayProbe.detail})` : ""}`;
  const bootstrapPath = path.join(
    resolveUserPath(options.workspaceDir),
    DEFAULT_BOOTSTRAP_FILENAME,
  );
  const hasBootstrap = await fs
    .access(bootstrapPath)
    .then(() => true)
    .catch(() => false);

  await prompter.note(
    [
      `Web UI: ${links.httpUrl}`,
      tokenParam ? `Web UI (with token): ${authedUrl}` : undefined,
      `Gateway WS: ${links.wsUrl}`,
      gatewayStatusLine,
      "Docs: https://docs.molt.bot/web/control-ui",
    ]
      .filter(Boolean)
      .join("\n"),
    "Control UI",
  );

  let controlUiOpened = false;
  let controlUiOpenHint: string | undefined;
  let seededInBackground = false;
  let hatchChoice: "tui" | "web" | "later" | null = null;

  if (!opts.skipUi && gatewayProbe.ok) {
    if (hasBootstrap) {
      await prompter.note(
        [
          "C'est ici que votre agent prend vie réellement.",
          "Prenez votre temps pour lui parler de vous.",
          "Plus il en saura, plus l'expérience sera riche.",
          'Nous allons envoyer : "Réveille-toi, mon ami !"',
        ].join("\n"),
        "Démarrer le TUI (Meilleure option !)",
      );
    }

    await prompter.note(
      [
        "Jeton Gateway : sécurité partagée pour la passerelle et l'interface.",
        "Stocké dans : ~/.alize/alize.json (gateway.auth.token) ou ALIZE_GATEWAY_TOKEN.",
        "L'interface Web stocke une copie dans le localStorage (alize.control.settings.v1).",
        `Retrouvez le lien avec jeton à tout moment : ${formatCliCommand("alize dashboard --no-open")}`,
      ].join("\n"),
      "Jeton de sécurité (Token)",
    );

    hatchChoice = (await prompter.select({
      message: "Comment souhaitez-vous réveiller votre agent ?",
      options: [
        { value: "tui", label: "Dans le Terminal (TUI - Recommandé)" },
        { value: "web", label: "Dans le Tableau de Bord (Web)" },
        { value: "later", label: "Plus tard" },
      ],
      initialValue: "tui",
    })) as "tui" | "web" | "later";

    if (hatchChoice === "tui") {
      await runTui({
        url: links.wsUrl,
        token: settings.authMode === "token" ? settings.gatewayToken : undefined,
        password: settings.authMode === "password" ? nextConfig.gateway?.auth?.password : "",
        // Safety: onboarding TUI should not auto-deliver to lastProvider/lastTo.
        deliver: false,
        message: hasBootstrap ? "Réveille-toi, mon ami !" : undefined,
      });
      if (settings.authMode === "token" && settings.gatewayToken) {
        seededInBackground = await openUrlInBackground(authedUrl);
      }
      if (seededInBackground) {
        await prompter.note(
          `Tableau de bord configuré en arrière-plan. Ouvrez-le plus tard avec : ${formatCliCommand(
            "alize dashboard --no-open",
          )}`,
          "Tableau de Bord",
        );
      }
    } else if (hatchChoice === "web") {
      const browserSupport = await detectBrowserOpenSupport();
      if (browserSupport.ok) {
        controlUiOpened = await openUrl(authedUrl);
        if (!controlUiOpened) {
          controlUiOpenHint = formatControlUiSshHint({
            port: settings.port,
            basePath: controlUiBasePath,
            token: settings.gatewayToken,
          });
        }
      } else {
        controlUiOpenHint = formatControlUiSshHint({
          port: settings.port,
          basePath: controlUiBasePath,
          token: settings.gatewayToken,
        });
      }
      await prompter.note(
        [
          `Lien du Tableau de Bord (avec jeton) : ${authedUrl}`,
          controlUiOpened
            ? "Ouvert dans votre navigateur. Gardez cet onglet pour piloter Alizé."
            : "Copiez/collez cette URL dans un navigateur sur cette machine pour piloter Alizé.",
          controlUiOpenHint,
        ]
          .filter(Boolean)
          .join("\n"),
        "Tableau de Bord prêt",
      );
    } else {
      await prompter.note(
        `Quand vous serez prêt : ${formatCliCommand("alize dashboard --no-open")}`,
        "Plus tard",
      );
    }
  } else if (opts.skipUi) {
    await prompter.note("Skipping Control UI/TUI prompts.", "Control UI");
  }

  await prompter.note(
    ["Back up your agent workspace.", "Docs: https://docs.molt.bot/concepts/agent-workspace"].join(
      "\n",
    ),
    "Workspace backup",
  );

  await prompter.note(
    "Faire tourner des agents sur votre machine comporte des risques — sécurisez votre installation : https://docs.molt.bot/security",
    "Sécurité",
  );

  const shouldOpenControlUi =
    !opts.skipUi &&
    settings.authMode === "token" &&
    Boolean(settings.gatewayToken) &&
    hatchChoice === null;
  if (shouldOpenControlUi) {
    const browserSupport = await detectBrowserOpenSupport();
    if (browserSupport.ok) {
      controlUiOpened = await openUrl(authedUrl);
      if (!controlUiOpened) {
        controlUiOpenHint = formatControlUiSshHint({
          port: settings.port,
          basePath: controlUiBasePath,
          token: settings.gatewayToken,
        });
      }
    } else {
      controlUiOpenHint = formatControlUiSshHint({
        port: settings.port,
        basePath: controlUiBasePath,
        token: settings.gatewayToken,
      });
    }

    await prompter.note(
      [
        `Lien du Tableau de Bord (avec jeton) : ${authedUrl}`,
        controlUiOpened
          ? "Ouvert dans votre navigateur. Gardez cet onglet pour piloter Alizé."
          : "Copiez/collez cette URL dans un navigateur sur cette machine pour piloter Alizé.",
        controlUiOpenHint,
      ]
        .filter(Boolean)
        .join("\n"),
      "Tableau de Bord prêt",
    );
  }

  const webSearchKey = (nextConfig.tools?.web?.search?.apiKey ?? "").trim();
  const webSearchEnv = (process.env.BRAVE_API_KEY ?? "").trim();
  const hasWebSearchKey = Boolean(webSearchKey || webSearchEnv);
  await prompter.note(
    hasWebSearchKey
      ? [
          "La recherche Web est active, votre agent pourra consulter Internet si besoin.",
          "",
          webSearchKey
            ? "Clé API : stockée dans la config (tools.web.search.apiKey)."
            : "Clé API : fournie via la variable d'environnement BRAVE_API_KEY.",
          "Docs : https://docs.molt.bot/tools/web",
        ].join("\n")
      : [
          "Pour que votre agent puisse faire des recherches Web, vous aurez besoin d'une clé API.",
          "",
          "Alizé utilise Brave Search pour l'outil `web_search`. Sans clé Brave, la recherche Web ne fonctionnera pas.",
          "",
          "Configurez-la maintenant :",
          `- Run : ${formatCliCommand("alize configure --section web")}`,
          "- Activez web_search et collez votre clé Brave Search API",
          "",
          "Alternative : définissez BRAVE_API_KEY dans l'environnement (sans changer la config).",
          "Docs : https://docs.molt.bot/tools/web",
        ].join("\n"),
    "Recherche Web (optionnel)",
  );

  await prompter.note(
    'Et maintenant : https://molt.bot/showcase ("Ce que le monde construit").',
    "Prochaines étapes",
  );

  await prompter.outro(
    controlUiOpened
      ? "Onboarding terminé. Le Tableau de Bord est ouvert avec votre jeton ; gardez cet onglet pour piloter Alizé."
      : seededInBackground
        ? "Onboarding terminé. L'interface Web est prête en arrière-plan ; ouvrez-la quand vous voulez avec le lien ci-dessus."
        : "Onboarding terminé. Utilisez le lien avec jeton ci-dessus pour piloter Alizé.",
  );
}
