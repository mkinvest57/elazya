# Elazya — App Tauri

> Application de bureau macOS construite avec Tauri 2 + React + TypeScript.

## 🏗 Architecture

```
elazya/
├── src-tauri/              ← Backend Rust
│   ├── src/
│   │   ├── main.rs              # Point d'entrée, commandes Tauri, state
│   │   ├── agent_base.rs        # Trait ElAgent (interface commune)
│   │   ├── agent_engine.rs      # Registre central des 10 agents
│   │   ├── openclaw_client.rs   # Client OpenClaw (callLLM, callSkill)
│   │   ├── agent_facturation.rs # 💰 Facturation Auto (complet)
│   │   ├── agents.rs            # 9 autres agents (squelettes)
│   │   ├── openclaw.rs          # Bridge WebSocket vers OpenClaw
│   │   └── openclaw_monitor.rs  # Monitoring tokens + channels
│   ├── migrations/              # Migrations SQLite
│   └── Cargo.toml
│
└── src/                    ← Frontend React
    ├── pages/
    │   └── Dashboard.tsx        # Layout + sidebar
    ├── components/
    │   ├── MissionControl.tsx   # Vue d'ensemble
    │   ├── AgentDetail.tsx      # Détail agent + config + logs
    │   └── panels/              # Chat, Config
    ├── lib/
    │   ├── openclaw-client.ts   # Client Tauri invoke
    │   ├── plan-limits.ts       # Agents par plan (Solo/Pro/Business)
    │   └── license.ts           # Gestion licence
    └── index.css                # Design tokens centralisés
```

## 🚀 Développement

```bash
npm install
npm run tauri dev
```

## 📊 Base de données

SQLite — 3 tables principales :

| Table | Usage |
|-------|-------|
| `settings` | Clés API, config globale |
| `agent_config` | Config par agent (enabled, settings JSON) |
| `agent_log` | Logs d'exécution des agents |

## 🔌 Comment ajouter un agent

1. Implémenter `ElAgent` dans un nouveau fichier ou dans `agents.rs`
2. L'enregistrer dans `agent_engine.rs` (`agents.insert(...)`)
3. C'est tout — le frontend le découvre automatiquement

[← Retour au README principal](../README.md)
