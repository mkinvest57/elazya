# Alizé - Site de Vente Ultime (Stitch Edition)

Le site de vente officiel pour Alizé, construit avec la stack "Ultimate" 2026.

## 🚀 Technologie Stack

- **Framework**: Next.js 14+ (App Router)
- **Langage**: TypeScript
- **Style**: Tailwind CSS + Stitch Design System 2.0 (Strict)
- **Base de Données**: Prisma + PostgreSQL
- **Paiements**: Stripe Integration (Checkout + Webhooks)
- **Emails**: Resend

## 🛠️ Installation

1.  **Cloner le repo**
    ```bash
    git clone https://github.com/votre-user/alize-site.git
    cd alize-site
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configuration des Variables d'Environnement**
    Copiez `.env.example` vers `.env` (créez-le si besoin) :

    ```env
    # App
    NEXT_PUBLIC_SITE_URL=http://localhost:3000

    # Stripe (Mode Test ou Live)
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    NEXT_PUBLIC_STRIPE_KEY=pk_test_...

    # Database (Connection String)
    DATABASE_URL="postgresql://user:password@localhost:5432/alize?schema=public"

    # Emails (Resend.com)
    RESEND_API_KEY=re_...
    ```

4.  **Initialiser la Base de Données**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Lancer le Serveur de Développement**
    ```bash
    npm run dev
    ```

## 💳 Configuration Stripe

1.  Créez un compte sur [dashboard.stripe.com](https://dashboard.stripe.com).
2.  Récupérez vos clés API (Publique et Secrète).
3.  Configurez un Webhook vers `https://votre-domaine.com/api/webhook`.
    *   Si vous testez en local, utilisez Stripe CLI : `stripe listen --forward-to localhost:3000/api/webhook`.
4.  Activez les moyens de paiement (Carte, Apple Pay, Google Pay).

## 🌍 Déploiement (Netlify / Vercel)

Ce projet est optimisé pour un déploiement "Zero Config".

### Netlify
1.  Connectez votre Repo GitHub.
2.  Build Command: `npm run build`.
3.  Publish Directory: `.next`.
4.  **Important**: Ajoutez toutes les variables d'environnement dans le dashboard Netlify.
5.  Activez le plugin `Next.js Runtime` (automatique).

### Vercel
1.  Importez le projet.
2.  Vercel détecte Next.js automatiquement.
3.  Ajoutez les variables d'environnement.
4.  Deploy.

## 🎨 Stitch Design System

Le design respecte strictement les tokens définis dans `tailwind.config.ts`.
- **Primaire**: `bg-primary` (Cyan #00d9ff)
- **Surface**: `bg-surface-0` (Dark #0f0f0f)
- **Composants**: Utilisez `Button`, `Card` depuis `@/components/ui`.

---
*Généré par Antigravity (Phase 16 - Ultimate)*
