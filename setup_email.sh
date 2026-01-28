#!/bin/bash
# 📧 Alizé Email Setup (Himalaya)
# Simplifie la configuration des emails pour Alizé

set -e

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📧 Configuration Email pour Alizé (via Himalaya)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. Vérifier si himalaya est installé
if ! command -v himalaya &> /dev/null; then
    echo -e "${YELLOW}Himalaya n'est pas installé.${NC}"
    if [[ "$(uname)" == "Darwin" ]] && command -v brew &> /dev/null; then
        echo -e "Installation en cours via Homebrew..."
        brew install himalaya
        echo -e "${GREEN}Himalaya installé !${NC}"
    else
        echo -e "${RED}Erreur : Veuillez installer 'himalaya' manuellement d'abord.${NC}"
        exit 1
    fi
fi

# 2. Demander les infos
echo -e "Nous allons configurer votre compte Gmail."
echo -e "${YELLOW}IMPORTANT : Vous devez utiliser un 'Mot de passe d'application' (pas votre mot de passe habituel).${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT : Vous devez utiliser un 'Mot de passe d'application' (pas votre mot de passe habituel).${NC}"
echo ""
echo -e "${BLUE}--- Lien direct pour créer le mot de passe ---${NC}"
echo -e "${BLUE}👉 https://myaccount.google.com/apppasswords${NC}"
echo ""
echo "Une fois sur la page :"
echo "1. Donnez un nom (ex: Alizé) et cliquez sur 'Créer'"
echo "2. Copiez le code de 16 lettres généré (sans les espaces)"
echo -e "${BLUE}---------------------------------------------${NC}"
echo ""

read -p "Votre adresse email (ex: moi@gmail.com) : " EMAIL
read -p "Votre nom complet (pour l'affichage) : " NAME
echo ""
echo -n "Votre mot de passe d'application (caché) : "
read -s PASSWORD
echo ""
echo ""

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
    echo -e "${RED}Email ou mot de passe vide. Annulation.${NC}"
    exit 1
fi

# Nettoyer le mot de passe (enlever les espaces)
PASSWORD=${PASSWORD// /}

# 3. Créer le dossier et le fichier config
CONFIG_DIR="$HOME/.config/himalaya"
CONFIG_FILE="$CONFIG_DIR/config.toml"
mkdir -p "$CONFIG_DIR"

# Extraire le nom d'utilisateur (partie avant @)
USER_ID=$(echo "$EMAIL" | cut -d@ -f1)

# Écrire la configuration
cat > "$CONFIG_FILE" << EOF
[accounts.default]
email = "$EMAIL"
display-name = "$NAME"
default = true

# IMAP Configuration (Réception)
backend.type = "imap"
backend.host = "imap.gmail.com"
backend.port = 993
backend.login = "$EMAIL"
backend.auth.type = "password"
backend.auth.cmd = "echo '$PASSWORD'"
backend.encryption.type = "tls"

# SMTP Configuration (Envoi)
message.send.backend.type = "smtp"
message.send.backend.host = "smtp.gmail.com"
message.send.backend.port = 587
message.send.backend.login = "$EMAIL"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "echo '$PASSWORD'"
message.send.backend.encryption.type = "start-tls"
EOF

chmod 600 "$CONFIG_FILE"

echo -e "${GREEN}✅ Configuration écrite dans $CONFIG_FILE${NC}"
echo ""

# 4. Tester la connexion
echo -e "Test de connexion..."
if himalaya account list &> /dev/null; then
    echo -e "${GREEN}✅ Connexion réussie ! Vos emails sont configurés.${NC}"
    echo -e "Alizé peut maintenant envoyer et recevoir des emails."
else
    echo -e "${RED}❌ La connexion a échoué.${NC}"
    echo -e "Vérifiez votre mot de passe d'application ou votre connexion internet."
fi

echo ""
