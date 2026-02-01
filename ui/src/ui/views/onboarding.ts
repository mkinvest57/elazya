import { html, nothing } from "lit";
import type { SkillStatusEntry, SkillStatusReport } from "../types";
import type { SkillMessageMap } from "../controllers/skills";

export type OnboardingProps = {
    loading: boolean;
    report: SkillStatusReport | null;
    error: string | null;
    edits: Record<string, string>;
    busyKey: string | null;
    messages: SkillMessageMap;
    onRefresh: () => void;
    onEdit: (skillKey: string, value: string) => void;
    onSaveKey: (skillKey: string) => void;
    onFinish: () => void;
};

export function renderOnboarding(props: OnboardingProps) {
    const skills = props.report?.skills ?? [];
    // Filter for skills that are missing requirements AND have a fixable config (e.g. env vars or API keys)
    const missingConfigSkills = skills.filter(
        (s) => (s.missing?.config?.length > 0 || s.missing?.env?.length > 0) && !s.disabled
    );

    return html`
    <div class="onboarding-container" style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="font-size: 4rem; margin-bottom: 20px;">🌬️</div>
        <h1 style="font-size: 2.5rem; margin-bottom: 10px;">Bienvenue sur Alizé</h1>
        <p style="font-size: 1.2rem; opacity: 0.8;">
          Configurons vos super-pouvoirs pour une expérience optimale.
        </p>
      </div>

      ${props.error
            ? html`<div class="callout danger" style="margin-bottom: 20px;">Error: ${props.error}</div>`
            : nothing}

      ${props.loading && !props.report
            ? html`<div class="muted" style="text-align: center;">Chargement des skills...</div>`
            : nothing}

      <div class="cards-stack">
        ${missingConfigSkills.length === 0 && !props.loading
            ? html`
              <div class="card" style="text-align: center; padding: 40px;">
                <div style="font-size: 2rem; margin-bottom: 20px;">✅</div>
                <h2>Tout est prêt !</h2>
                <p class="muted">Tous vos skills sont configurés et opérationnels.</p>
                <button
                  class="btn primary large"
                  style="margin-top: 30px;"
                  @click=${props.onFinish}
                >
                  Lancer Alizé
                </button>
              </div>
            `
            : html`
              <div class="section-title" style="margin-bottom: 20px; font-weight: bold;">
                ⚠️ Configuration Requise (${missingConfigSkills.length})
              </div>
              ${missingConfigSkills.map((skill) => renderOnboardingSkill(skill, props))}
              
              <div style="margin-top: 40px; text-align: center;">
                 <p class="muted" style="margin-bottom: 20px;">
                   Vous pourrez configurer les autres skills plus tard.
                 </p>
                 <button class="btn primary large" @click=${props.onFinish}>
                   Continuer vers le Tableau de Bord
                 </button>
              </div>
            `}
      </div>
    </div>
  `;
}

function renderOnboardingSkill(skill: SkillStatusEntry, props: OnboardingProps) {
    const busy = props.busyKey === skill.skillKey;
    const apiKey = props.edits[skill.skillKey] ?? "";
    const message = props.messages[skill.skillKey] ?? null;

    // Determine what is missing to show helpful French text
    const missingText = [];
    if (skill.missing.env.length > 0) missingText.push(`Variables d'environnement: ${skill.missing.env.join(", ")}`);
    if (skill.missing.config.length > 0) missingText.push(`Configuration: ${skill.missing.config.join(", ")}`);

    // Naive check for API key field need: usually 'primaryEnv' implies a single key needed
    const showKeyInput = !!skill.primaryEnv;

    return html`
    <div class="card" style="margin-bottom: 20px; border-left: 4px solid var(--accent-color);">
      <div class="row" style="align-items: flex-start;">
        <div style="font-size: 2rem; margin-right: 15px;">${skill.emoji || "🧩"}</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 5px 0;">${skill.name}</h3>
          <p class="muted" style="margin: 0;">${skill.description}</p>
          
          ${missingText.length > 0
            ? html`<div class="callout warning" style="margin-top: 10px; font-size: 0.9em;">
                ${missingText.join(" | ")}
              </div>`
            : nothing}

          ${message
            ? html`<div
                class="callout ${message.kind === "error" ? "danger" : "success"}"
                style="margin-top: 10px;"
              >
                ${message.message}
              </div>`
            : nothing}

          ${showKeyInput
            ? html`
                <div style="margin-top: 15px;">
                  <label class="field">
                    <span>Clé API (${skill.primaryEnv})</span>
                    <div class="row">
                        <input
                        type="password"
                        .value=${apiKey}
                        placeholder="sk-..."
                        @input=${(e: Event) =>
                    props.onEdit(skill.skillKey, (e.target as HTMLInputElement).value)}
                        style="flex: 1;"
                        />
                        <button
                        class="btn primary"
                        ?disabled=${busy || !apiKey}
                        @click=${() => props.onSaveKey(skill.skillKey)}
                        >
                        ${busy ? "..." : "Sauvegarder"}
                        </button>
                    </div>
                  </label>
                </div>
              `
            : html`
                <div style="margin-top: 15px;">
                    <a href="https://docs.molt.bot/skills/${skill.name}" target="_blank" class="btn">
                        Documentation
                    </a>
                </div>
            `}
        </div>
      </div>
    </div>
  `;
}
