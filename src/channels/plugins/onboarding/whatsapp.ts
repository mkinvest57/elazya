import fs from "node:fs/promises";
import path from "node:path";
import { loginWeb } from "../../../channel-web.js";
import type { AlizeConfig } from "../../../config/config.js";
import { mergeWhatsAppConfig } from "../../../config/merge-config.js";
import type { DmPolicy } from "../../../config/types.js";
import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";
import type { RuntimeEnv } from "../../../runtime.js";
import { formatDocsLink } from "../../../terminal/links.js";
import { formatCliCommand } from "../../../cli/command-format.js";
import { normalizeE164 } from "../../../utils.js";
import {
  listWhatsAppAccountIds,
  resolveDefaultWhatsAppAccountId,
  resolveWhatsAppAuthDir,
} from "../../../web/accounts.js";
import type { WizardPrompter } from "../../../wizard/prompts.js";
import type { ChannelOnboardingAdapter } from "../onboarding-types.js";
import { promptAccountId } from "./helpers.js";

const channel = "whatsapp" as const;

function setWhatsAppDmPolicy(cfg: AlizeConfig, dmPolicy: DmPolicy): AlizeConfig {
  return mergeWhatsAppConfig(cfg, { dmPolicy });
}

function setWhatsAppAllowFrom(cfg: AlizeConfig, allowFrom?: string[]): AlizeConfig {
  return mergeWhatsAppConfig(cfg, { allowFrom }, { unsetOnUndefined: ["allowFrom"] });
}

function setWhatsAppSelfChatMode(cfg: AlizeConfig, selfChatMode: boolean): AlizeConfig {
  return mergeWhatsAppConfig(cfg, { selfChatMode });
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function detectWhatsAppLinked(cfg: AlizeConfig, accountId: string): Promise<boolean> {
  const { authDir } = resolveWhatsAppAuthDir({ cfg, accountId });
  const credsPath = path.join(authDir, "creds.json");
  return await pathExists(credsPath);
}

async function promptWhatsAppAllowFrom(
  cfg: AlizeConfig,
  _runtime: RuntimeEnv,
  prompter: WizardPrompter,
  options?: { forceAllowlist?: boolean },
): Promise<AlizeConfig> {
  const existingPolicy = cfg.channels?.whatsapp?.dmPolicy ?? "pairing";
  const existingAllowFrom = cfg.channels?.whatsapp?.allowFrom ?? [];
  const existingLabel = existingAllowFrom.length > 0 ? existingAllowFrom.join(", ") : "unset";

  if (options?.forceAllowlist) {
    await prompter.note(
      "Nous avons besoin de votre numéro personnel pour que Alizé puisse vous autoriser.",
      "Numéro WhatsApp",
    );
    const entry = await prompter.text({
      message: "Votre numéro WhatsApp personnel (celui avec lequel vous écrirez)",
      placeholder: "+33612345678",
      initialValue: existingAllowFrom[0],
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) return "Requis";
        const normalized = normalizeE164(raw);
        if (!normalized) return `Numéro invalide : ${raw}`;
        return undefined;
      },
    });
    const normalized = normalizeE164(String(entry).trim());
    const merged = [
      ...existingAllowFrom
        .filter((item) => item !== "*")
        .map((item) => normalizeE164(item))
        .filter(Boolean),
      normalized,
    ];
    const unique = [...new Set(merged.filter(Boolean))];
    let next = setWhatsAppSelfChatMode(cfg, true);
    next = setWhatsAppDmPolicy(next, "allowlist");
    next = setWhatsAppAllowFrom(next, unique);
    await prompter.note(
      ["Mode Liste blanche activé.", `- allowFrom inclut ${normalized}`].join("\n"),
      "Liste blanche WhatsApp",
    );
    return next;
  }

  await prompter.note(
    [
      "Les discussions WhatsApp sont filtrées par `channels.whatsapp.dmPolicy` + `channels.whatsapp.allowFrom`.",
      "- appairage (défaut) : les nouveaux expéditeurs reçoivent un code ; vous validez",
      "- liste blanche (allowlist) : les expéditeurs inconnus sont bloqués",
      '- ouvert (open) : DMs publics (nécessite "*" dans allowFrom)',
      "- désactivé : ignorer les messages WhatsApp",
      "",
      `Actuel : dmPolicy=${existingPolicy}, allowFrom=${existingLabel}`,
      `Docs : ${formatDocsLink("/whatsapp", "whatsapp")}`,
    ].join("\n"),
    "Contrôle d'accès WhatsApp",
  );

  const phoneMode = (await prompter.select({
    message: "Configuration du numéro WhatsApp",
    options: [
      { value: "personal", label: "C'est mon numéro personnel" },
      { value: "separate", label: "C'est un numéro dédié à Alizé" },
    ],
  })) as "personal" | "separate";

  if (phoneMode === "personal") {
    await prompter.note(
      "Nous avons besoin du numéro de l'expéditeur/propriétaire pour que Alizé puisse vous autoriser.",
      "Numéro WhatsApp",
    );
    const entry = await prompter.text({
      message:
        "Votre numéro WhatsApp personnel (le téléphone depuis lequel vous enverrez des messages)",
      placeholder: "+33612345678",
      initialValue: existingAllowFrom[0],
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) return "Requis";
        const normalized = normalizeE164(raw);
        if (!normalized) return `Numéro invalide : ${raw}`;
        return undefined;
      },
    });
    const normalized = normalizeE164(String(entry).trim());
    const merged = [
      ...existingAllowFrom
        .filter((item) => item !== "*")
        .map((item) => normalizeE164(item))
        .filter(Boolean),
      normalized,
    ];
    const unique = [...new Set(merged.filter(Boolean))];
    let next = setWhatsAppSelfChatMode(cfg, true);
    next = setWhatsAppDmPolicy(next, "allowlist");
    next = setWhatsAppAllowFrom(next, unique);
    await prompter.note(
      [
        "Mode numéro personnel activé.",
        "- dmPolicy réglé sur liste blanche (appairage ignoré)",
        `- allowFrom inclut ${normalized}`,
      ].join("\n"),
      "Numéro personnel WhatsApp",
    );
    return next;
  }

  const policy = (await prompter.select({
    message: "Politique d'accès WhatsApp",
    options: [
      { value: "pairing", label: "Appairage (recommandé)" },
      { value: "allowlist", label: "Liste blanche uniquement (bloque les inconnus)" },
      { value: "open", label: "Ouvert (DMs publics)" },
      { value: "disabled", label: "Désactivé (ignorer les DMs)" },
    ],
  })) as DmPolicy;

  let next = setWhatsAppSelfChatMode(cfg, false);
  next = setWhatsAppDmPolicy(next, policy);
  if (policy === "open") {
    next = setWhatsAppAllowFrom(next, ["*"]);
  }
  if (policy === "disabled") return next;

  const allowOptions =
    existingAllowFrom.length > 0
      ? ([
          { value: "keep", label: "Conserver la liste actuelle" },
          {
            value: "unset",
            label: "Réinitialiser (utiliser uniquement l'appairage)",
          },
          { value: "list", label: "Définir des numéros spécifiques" },
        ] as const)
      : ([
          { value: "unset", label: "Aucune liste blanche (défaut)" },
          { value: "list", label: "Définir des numéros spécifiques" },
        ] as const);

  const mode = (await prompter.select({
    message: "Liste blanche WhatsApp (optionnelle)",
    options: allowOptions.map((opt) => ({
      value: opt.value,
      label: opt.label,
    })),
  })) as (typeof allowOptions)[number]["value"];

  if (mode === "keep") {
    // Keep allowFrom as-is.
  } else if (mode === "unset") {
    next = setWhatsAppAllowFrom(next, undefined);
  } else {
    const allowRaw = await prompter.text({
      message: "Numéros autorisés (séparés par des virgules, format E.164)",
      placeholder: "+33612345678, +447700900123",
      validate: (value) => {
        const raw = String(value ?? "").trim();
        if (!raw) return "Requis";
        const parts = raw
          .split(/[\n,;]+/g)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length === 0) return "Requis";
        for (const part of parts) {
          if (part === "*") continue;
          const normalized = normalizeE164(part);
          if (!normalized) return `Numéro invalide : ${part}`;
        }
        return undefined;
      },
    });

    const parts = String(allowRaw)
      .split(/[\n,;]+/g)
      .map((p) => p.trim())
      .filter(Boolean);
    const normalized = parts.map((part) => (part === "*" ? "*" : normalizeE164(part)));
    const unique = [...new Set(normalized.filter(Boolean))];
    next = setWhatsAppAllowFrom(next, unique);
  }

  return next;
}

export const whatsappOnboardingAdapter: ChannelOnboardingAdapter = {
  channel,
  getStatus: async ({ cfg, accountOverrides }) => {
    const overrideId = accountOverrides.whatsapp?.trim();
    const defaultAccountId = resolveDefaultWhatsAppAccountId(cfg);
    const accountId = overrideId ? normalizeAccountId(overrideId) : defaultAccountId;
    const linked = await detectWhatsAppLinked(cfg, accountId);
    const accountLabel = accountId === DEFAULT_ACCOUNT_ID ? "default" : accountId;
    return {
      channel,
      configured: linked,
      statusLines: [`WhatsApp (${accountLabel}) : ${linked ? "relié" : "non relié"}`],
      selectionHint: linked ? "relié" : "non relié",
      quickstartScore: linked ? 5 : 4,
    };
  },
  configure: async ({
    cfg,
    runtime,
    prompter,
    options,
    accountOverrides,
    shouldPromptAccountIds,
    forceAllowFrom,
  }) => {
    const overrideId = accountOverrides.whatsapp?.trim();
    let accountId = overrideId
      ? normalizeAccountId(overrideId)
      : resolveDefaultWhatsAppAccountId(cfg);
    if (shouldPromptAccountIds || options?.promptWhatsAppAccountId) {
      if (!overrideId) {
        accountId = await promptAccountId({
          cfg,
          prompter,
          label: "WhatsApp",
          currentId: accountId,
          listAccountIds: listWhatsAppAccountIds,
          defaultAccountId: resolveDefaultWhatsAppAccountId(cfg),
        });
      }
    }

    let next = cfg;
    if (accountId !== DEFAULT_ACCOUNT_ID) {
      next = {
        ...next,
        channels: {
          ...next.channels,
          whatsapp: {
            ...next.channels?.whatsapp,
            accounts: {
              ...next.channels?.whatsapp?.accounts,
              [accountId]: {
                ...next.channels?.whatsapp?.accounts?.[accountId],
                enabled: next.channels?.whatsapp?.accounts?.[accountId]?.enabled ?? true,
              },
            },
          },
        },
      };
    }

    const linked = await detectWhatsAppLinked(next, accountId);
    const { authDir } = resolveWhatsAppAuthDir({
      cfg: next,
      accountId,
    });

    if (!linked) {
      await prompter.note(
        [
          "Scannez le QR code avec WhatsApp sur votre téléphone.",
          `Les identifiants seront stockés dans ${authDir}/ pour les prochaines fois.`,
          `Docs : ${formatDocsLink("/whatsapp", "whatsapp")}`,
        ].join("\n"),
        "Liaison WhatsApp",
      );
    }
    const wantsLink = await prompter.confirm({
      message: linked
        ? "WhatsApp déjà relié. Re-relier maintenant ?"
        : "Relier WhatsApp maintenant (QR) ?",
      initialValue: !linked,
    });
    if (wantsLink) {
      try {
        await loginWeb(false, undefined, runtime, accountId);
      } catch (err) {
        runtime.error(`Échec de la connexion WhatsApp : ${String(err)}`);
        await prompter.note(`Docs : ${formatDocsLink("/whatsapp", "whatsapp")}`, "Aide WhatsApp");
      }
    } else if (!linked) {
      await prompter.note(
        `Lancez \`${formatCliCommand("alize channels login")}\` plus tard pour relier WhatsApp.`,
        "WhatsApp",
      );
    }

    next = await promptWhatsAppAllowFrom(next, runtime, prompter, {
      forceAllowlist: forceAllowFrom,
    });

    return { cfg: next, accountId };
  },
  onAccountRecorded: (accountId, options) => {
    options?.onWhatsAppAccountId?.(accountId);
  },
};
