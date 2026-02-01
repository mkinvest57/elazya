# Alizé v1000 - OpenClaw Launcher

**Alizé v1000** est une interface graphique native (Launcher) pour le moteur d'IA **OpenClaw**. Elle permet d'installer, de configurer et de piloter votre assistant IA personnel sans toucher au terminal.

## À quoi ça sert ?
*   **Installation Simplifiée** : Vérifie et installe automatiquement Node.js et OpenClaw.
*   **Configuration Visuelle** : Un assistant pas-à-pas pour vos clés API (OpenAI, Anthropic) et vos canaux (Telegram, WhatsApp).
*   **Tableau de Bord** : Visualisez votre consommation de tokens, vos coûts et l'état de vos connexions en temps réel.
*   **Mode "Mission Control"** : Le moteur tourne en arrière-plan pendant que vous utilisez l'IA via Telegram ou l'interface de chat intégrée.

## Structure
*   **Frontend (React + Tailwind)** : Interface utilisateur "Premium", Wizard d'installation, Dashboard.
*   **Backend (Rust/Tauri)** : Gestionnaire de processus (démarre/arrête le moteur), moniteur de fichiers (lit `~/.openclaw` en temps réel).

## Installation

### Pour les Développeurs (Mode Dev)
1.  Prérequis : Rust, Node.js v22+
2.  `npm install`
3.  `npm run tauri dev`

### Pour les Utilisateurs (Build)
Pour créer une application native (`.app` sur macOS, `.exe` sur Windows) :

```bash
npm run tauri build
```

L'application sera générée dans `src-tauri/target/release/bundle/`.
