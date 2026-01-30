import { DEFAULT_ACCOUNT_ID, normalizeAccountId } from "../../../routing/session-key.js";
import type { PromptAccountId, PromptAccountIdParams } from "../onboarding-types.js";

export const promptAccountId: PromptAccountId = async (params: PromptAccountIdParams) => {
  const existingIds = params.listAccountIds(params.cfg);
  const initial = params.currentId?.trim() || params.defaultAccountId || DEFAULT_ACCOUNT_ID;
  const choice = (await params.prompter.select({
    message: `Compte ${params.label}`,
    options: [
      ...existingIds.map((id) => ({
        value: id,
        label: id === DEFAULT_ACCOUNT_ID ? "défaut (principal)" : id,
      })),
      { value: "__new__", label: "Ajouter un nouveau compte" },
    ],
    initialValue: initial,
  })) as string;

  if (choice !== "__new__") return normalizeAccountId(choice);

  const entered = await params.prompter.text({
    message: `Nouvel identifiant de compte ${params.label}`,
    validate: (value) => (value?.trim() ? undefined : "Requis"),
  });
  const normalized = normalizeAccountId(String(entered));
  if (String(entered).trim() !== normalized) {
    await params.prompter.note(
      `Identifiant de compte normalisé en "${normalized}".`,
      `Compte ${params.label}`,
    );
  }
  return normalized;
};

export function addWildcardAllowFrom(
  allowFrom?: Array<string | number> | null,
): Array<string | number> {
  const next = (allowFrom ?? []).map((v) => String(v).trim()).filter(Boolean);
  if (!next.includes("*")) next.push("*");
  return next;
}
