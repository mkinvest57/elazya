# Elazya — Tableau de Bord IA pour Mac

> 10 agents IA qui automatisent tes tâches quotidiennes directement sur ton Mac.

---

## 📁 Structure du Projet

| Dossier | Description | Lien |
|---------|-------------|------|
| **[`elazya/`](./elazya)** | 🖥️ App native macOS (Tauri + React) | [→ Voir le README](./elazya/README.md) |
| **[`stitch-site/`](./stitch-site)** | 🌐 Site web elazya.com (Next.js) | [→ Voir le README](./stitch-site/README.md) |
| **[`openclaw-main/`](./openclaw-main)** | ⚙️ Moteur OpenClaw (Node.js, gateway LLM) | [→ Voir le dossier](./openclaw-main) |

---

## 🖥️ L'app Elazya (`elazya/`)

L'application de bureau, construite avec **Tauri 2 + React + TypeScript**.

### Architecture agents (backend Rust)

| Fichier | Rôle |
|---------|------|
| [`agent_base.rs`](./elazya/src-tauri/src/agent_base.rs) | Trait `ElAgent` — interface commune pour tous les agents |
| [`agent_engine.rs`](./elazya/src-tauri/src/agent_engine.rs) | Registre central — charge et dispatch les 10 agents |
| [`openclaw_client.rs`](./elazya/src-tauri/src/openclaw_client.rs) | Client OpenClaw générique (`callLLM`, `callSkill`) |
| [`agent_facturation.rs`](./elazya/src-tauri/src/agent_facturation.rs) | 💰 **Facturation Auto** — agent complet (watcher + OpenClaw + file ops) |
| [`agents.rs`](./elazya/src-tauri/src/agents.rs) | 9 autres agents (squelettes avec vrais prompts LLM) |
| [`main.rs`](./elazya/src-tauri/src/main.rs) | Point d'entrée Tauri — commandes, state, setup |
| [`openclaw.rs`](./elazya/src-tauri/src/openclaw.rs) | Bridge WebSocket vers le moteur OpenClaw |

### Interface (frontend React)

| Fichier | Rôle |
|---------|------|
| [`Dashboard.tsx`](./elazya/src/pages/Dashboard.tsx) | Layout principal + sidebar avec liste des agents |
| [`MissionControl.tsx`](./elazya/src/components/MissionControl.tsx) | Vue d'ensemble — stats, activité récente, upgrade |
| [`AgentDetail.tsx`](./elazya/src/components/AgentDetail.tsx) | Page détail d'un agent — config, toggle, logs |
| [`index.css`](./elazya/src/index.css) | Tokens de design centralisés + micro-interactions |

---

## 🌐 Le site web (`stitch-site/`)

Site de présentation et de vente sur **elazya.com**. Construit avec **Next.js**.

| Fichier clé | Rôle |
|-------------|------|
| [`Hero.tsx`](./stitch-site/src/components/sections/Hero.tsx) | Section hero de la landing page |
| [`api/webhooks/stripe/`](./stitch-site/src/app/api/webhooks/stripe) | Webhook Stripe pour les paiements |
| [`api/generate-license/`](./stitch-site/src/app/api/generate-license) | Génération de licence après achat |
| [`api/validate-license/`](./stitch-site/src/app/api/validate-license) | Validation de licence par l'app |

---

## ⚙️ Le moteur OpenClaw (`openclaw-main/`)

Moteur IA local en Node.js — fait le pont entre l'app et les LLMs (Claude, GPT-4, Gemini, Ollama).

- Gateway WebSocket sur `ws://127.0.0.1:18789`
- Supporte multi-providers (OpenAI, Anthropic, Google, Ollama, etc.)
- Skills extensibles (email, calendrier, fichiers…)

---

## 🚀 Lancer en développement

```bash
# 1. App Tauri
cd elazya
npm install
npm run tauri dev

# 2. Site web
cd stitch-site
npm install
npm run dev
```

---

## 🤖 Les 10 Agents

| # | Agent | ID | Status |
|---|-------|----|--------|
| 1 | 💰 Facturation Auto | `facturation` | ✅ Complet |
| 2 | 📧 Onboarding Client Express | `onboarding-client` | 🔧 Squelette |
| 3 | 📱 LinkedIn Digest | `linkedin-digest` | 🔧 Squelette |
| 4 | 🎯 Qualification Leads Auto | `qualification` | 🔧 Squelette |
| 5 | 🏃 Routine Matinale | `routine-matinale` | 🔧 Squelette |
| 6 | 🎨 CRM Prospect | `crm-prospect` | 🔧 Squelette |
| 7 | 📄 Devis Express | `devis-express` | 🔧 Squelette |
| 8 | 💼 Email Intelligent | `email-intelligent` | 🔧 Squelette |
| 9 | 📊 Compta Export | `compta-export` | 🔧 Squelette |
| 10 | 🚀 Content LinkedIn | `content-linkedin` | 🔧 Squelette |

---

## 📦 Stack technique

| Composant | Techno |
|-----------|--------|
| App native | Tauri 2, Rust |
| Frontend | React, TypeScript, Framer Motion |
| Styling | Tailwind CSS + tokens CSS custom |
| Base de données | SQLite (via sqlx) |
| Moteur IA | OpenClaw (Node.js, WebSocket) |
| Site web | Next.js |
| Paiements | Stripe |

---

## 📄 Licence

MIT — voir [LICENSE](./LICENSE)
