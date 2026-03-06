# Configuration de votre Bot Telegram Elazya

Suivez ces 3 étapes pour activer le contrôle de vos agents via Telegram.

## Étape 1 : Créer le Bot via @BotFather
1. Ouvrez Telegram et cherchez le compte **@BotFather**.
2. Envoyez la commande `/newbot`.
3. Donnez un nom à votre bot (ex: "Elazya Assistant") et un username (doit finir par `bot`, ex: `elazya_123_bot`).
4. **Récupérez le "HTTP API Token"** (le long code de type `7123456789:ABCDefgh...`).

## Étape 2 : Récupérer votre ID Telegram
1. Cherchez le bot **@userinfobot** sur Telegram.
2. Envoyez-lui n'importe quel message.
3. Il vous répondra avec votre **Id** (un nombre, ex: `543216789`).

## Étape 3 : Configurer OpenClaw
1. Ouvrez le fichier de configuration :
   `/Users/sashimi/Library/Application Support/fr.elazya.assistant/engine/elazya-engine-state/openclaw.json`
2. Remplacez les valeurs suivantes :
   - `"botToken": "VOTRE_TOKEN_BOT_TELEGRAM"` → Collez votre token de l'Étape 1.
   - `"allowFrom": ["VOTRE_ID_UTILISATEUR_TELEGRAM"]` → Collez votre ID de l'Étape 2 (gardez les guillemets et les crochets).
3. Redémarrez Elazya.

---
**Note :** Vos agents sont maintenant accessibles via le menu "Commandes" de votre Bot Telegram (icône à gauche du champ texte). Lancez `/brief` pour tester !
