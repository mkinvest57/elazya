import { html } from "lit";

import type { GatewayHelloOk } from "../gateway";
import { formatAgo, formatDurationMs } from "../format";
import { formatNextRun } from "../presenter";
import type { UiSettings } from "../storage";

export type OverviewProps = {
  connected: boolean;
  hello: GatewayHelloOk | null;
  settings: UiSettings;
  password: string;
  lastError: string | null;
  presenceCount: number;
  sessionsCount: number | null;
  cronEnabled: boolean | null;
  cronNext: number | null;
  lastChannelsRefresh: number | null;
  onSettingsChange: (next: UiSettings) => void;
  onPasswordChange: (next: string) => void;
  onSessionKeyChange: (next: string) => void;
  onConnect: () => void;
  onRefresh: () => void;
};

export function renderOverview(props: OverviewProps) {
  const snapshot = props.hello?.snapshot as
    | { uptimeMs?: number; policy?: { tickIntervalMs?: number } }
    | undefined;
  const uptime = snapshot?.uptimeMs ? formatDurationMs(snapshot.uptimeMs) : "n/a";
  const tick = snapshot?.policy?.tickIntervalMs
    ? `${snapshot.policy.tickIntervalMs}ms`
    : "n/a";
  const authHint = (() => {
    if (props.connected || !props.lastError) return null;
    const lower = props.lastError.toLowerCase();
    const authFailed = lower.includes("unauthorized") || lower.includes("connect failed");
    if (!authFailed) return null;
    const hasToken = Boolean(props.settings.token.trim());
    const hasPassword = Boolean(props.password.trim());
    if (!hasToken && !hasPassword) {
      return html`
        <div class="muted" style="margin-top: 8px;">
          Cette passerelle nécessite une authentification. Ajoutez un jeton ou un mot de passe, puis cliquez sur Connexion.
          <div style="margin-top: 6px;">
            <span class="mono">alize dashboard --no-open</span> → URL avec jeton<br />
            <span class="mono">alize doctor --generate-gateway-token</span> → définir le jeton
          </div>
          <div style="margin-top: 6px;">
            <a
              class="session-link"
              href="https://docs.molt.bot/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="Documentation auth UI (nouvel onglet)"
              >Docs : Auth Control UI</a
            >
          </div>
        </div>
      `;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        Auth échouée. Copiez l'URL avec jeton via
        <span class="mono">alize dashboard --no-open</span>, ou mettez à jour la clé,
        puis Connecter.
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.molt.bot/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="Documentation Auth (nouvel onglet)"
            >Docs : Auth Control UI</a
          >
        </div>
      </div>
    `;
  })();
  const insecureContextHint = (() => {
    if (props.connected || !props.lastError) return null;
    const isSecureContext = typeof window !== "undefined" ? window.isSecureContext : true;
    if (isSecureContext !== false) return null;
    const lower = props.lastError.toLowerCase();
    if (!lower.includes("secure context") && !lower.includes("device identity required")) {
      return null;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        Navigateur non sécurisé (HTTP). L'identité de l'appareil est bloquée.
        Utilisez HTTPS (Tailscale Serve) ou l'hôte local <span class="mono">http://127.0.0.1:18789</span>.
        <div style="margin-top: 6px;">
          Alternative : autorisez l'auth non sécurisée via
          <span class="mono">gateway.controlUi.allowInsecureAuth: true</span>.
        </div>
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.molt.bot/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="Docs Tailscale Serve"
            >Docs : Tailscale Serve</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.molt.bot/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="Docs HTTP Insecure"
            >Docs : Insecure HTTP</a
          >
        </div>
      </div>
    `;
  })();

  return html`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">Accès Passerelle</div>
        <div class="card-sub">Connexion au dashboard.</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>URL WebSocket</span>
            <input
              .value=${props.settings.gatewayUrl}
              @input=${(e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      props.onSettingsChange({ ...props.settings, gatewayUrl: v });
    }}
              placeholder="ws://100.x.y.z:18789"
            />
          </label>
          <label class="field">
            <span>Jeton (Token)</span>
            <input
              .value=${props.settings.token}
              @input=${(e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      props.onSettingsChange({ ...props.settings, token: v });
    }}
              placeholder="CLAWDBOT_GATEWAY_TOKEN"
            />
          </label>
          <label class="field">
            <span>Mot de passe (non stocké)</span>
            <input
              type="password"
              .value=${props.password}
              @input=${(e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      props.onPasswordChange(v);
    }}
              placeholder="mot de passe système"
            />
          </label>
          <label class="field">
            <span>Clé de Session par défaut</span>
            <input
              .value=${props.settings.sessionKey}
              @input=${(e: Event) => {
      const v = (e.target as HTMLInputElement).value;
      props.onSessionKeyChange(v);
    }}
            />
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${() => props.onConnect()}>Connexion</button>
          <button class="btn" @click=${() => props.onRefresh()}>Actualiser</button>
          <span class="muted">Connectez-vous pour appliquer.</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">État</div>
        <div class="card-sub">Informations de connexion.</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">Statut</div>
            <div class="stat-value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? "Connecté" : "Déconnecté"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">Uptime</div>
            <div class="stat-value">${uptime}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Tick Rate</div>
            <div class="stat-value">${tick}</div>
          </div>
          <div class="stat">
            <div class="stat-label">Dernière MAJ</div>
            <div class="stat-value">
              ${props.lastChannelsRefresh
      ? formatAgo(props.lastChannelsRefresh)
      : "n/a"}
            </div>
          </div>
        </div>
        ${props.lastError
      ? html`<div class="callout danger" style="margin-top: 14px;">
              <div>${props.lastError}</div>
              ${authHint ?? ""}
              ${insecureContextHint ?? ""}
            </div>`
      : html`<div class="callout" style="margin-top: 14px;">
              Utilisez l'onglet Canaux pour connecter WhatsApp, Telegram, etc.
            </div>`}
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">Instances</div>
        <div class="stat-value">${props.presenceCount}</div>
        <div class="muted">Clients connectés (5min).</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Sessions</div>
        <div class="stat-value">${props.sessionsCount ?? "n/a"}</div>
        <div class="muted">Clés actives.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Cron</div>
        <div class="stat-value">
          ${props.cronEnabled == null
      ? "n/a"
      : props.cronEnabled
        ? "Activé"
        : "Désactivé"}
        </div>
        <div class="muted">Prochain: ${formatNextRun(props.cronNext)}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Notes</div>
      <div class="card-sub">Astuces de configuration.</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">Tailscale</div>
          <div class="muted">
            Utilisez "serve" pour sécuriser l'accès et simplifier l'auth.
          </div>
        </div>
        <div>
          <div class="note-title">Sessions</div>
          <div class="muted">Utilisez /new pour réinitialiser le contexte d'une conversation.</div>
        </div>
        <div>
          <div class="note-title">Tâches Cron</div>
          <div class="muted">Isolez les tâches récurrentes dans des sessions dédiées.</div>
        </div>
      </div>
    </section>
  `;
}
