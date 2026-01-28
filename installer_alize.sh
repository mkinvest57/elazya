#!/bin/bash
#
# 🌬️ Installateur Alizé
# Le premier agent IA français haute performance
# Basé sur Moltbot (https://github.com/moltbot/moltbot)
#

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Fonction pour afficher les messages
info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

step() {
    echo -e "\n${BLUE}${BOLD}[$1/5]${NC} $2"
}

# Bannière
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}🌬️  Bienvenue dans l'installation d'Alizé!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "    ${BOLD}Le premier assistant IA français haute performance${NC}"
echo -e "    Basé sur Moltbot par Peter Steinberger"
echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 1: Détection du système
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "1" "Détection de votre système..."

OS_TYPE=$(uname -s)
SHELL_TYPE=$(basename "$SHELL")
ARCH=$(uname -m)

if [[ "$OS_TYPE" == "Darwin" ]]; then
    success "macOS détecté ($ARCH)"
    OS_NAME="macos"
elif [[ "$OS_TYPE" == "Linux" ]]; then
    success "Linux détecté ($ARCH)"
    OS_NAME="linux"
else
    error "Système non supporté: $OS_TYPE"
    echo "Alizé supporte macOS et Linux."
    exit 1
fi

info "Shell: $SHELL_TYPE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 2: Vérification des dépendances
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "2" "Vérification de Node.js..."

if ! command -v node &> /dev/null; then
    warning "Node.js n'est pas installé"
    
    if [[ "$OS_NAME" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            info "Installation de Node.js via Homebrew..."
            brew install node@22
            success "Node.js installé"
        else
            error "Homebrew n'est pas installé."
            echo "Installez Node.js manuellement: https://nodejs.org/"
            exit 1
        fi
    else
        error "Veuillez installer Node.js manuellement."
        echo "Visitez: https://nodejs.org/"
        exit 1
    fi
else
    NODE_VERSION=$(node --version)
    success "Node.js $NODE_VERSION détecté"
fi

# Vérification pnpm
if ! command -v pnpm &> /dev/null; then
    warning "pnpm n'est pas installé"
    info "Installation de pnpm..."
    npm install -g pnpm
    success "pnpm installé"
else
    PNPM_VERSION=$(pnpm --version)
    success "pnpm $PNPM_VERSION détecté"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 3: Installation des dépendances
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "3" "Installation des dépendances..."

# Aller dans le répertoire du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

info "Assemblage d'Alizé en cours... ⏳"
echo ""

if pnpm install --silent 2>/dev/null; then
    success "Dépendances installées"
else
    warning "Installation avec logs détaillés..."
    pnpm install
    success "Dépendances installées"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 4: Compilation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "4" "Compilation d'Alizé..."

if pnpm build --silent 2>/dev/null; then
    success "Alizé compilé avec succès"
else
    warning "Compilation avec logs détaillés..."
    pnpm build
    success "Alizé compilé avec succès"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 5: Configuration du PATH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "5" "Configuration du PATH..."

ALIZE_BIN="$SCRIPT_DIR"

# Déterminer le fichier RC
if [[ "$SHELL_TYPE" == "zsh" ]]; then
    RC_FILE="$HOME/.zshrc"
elif [[ "$SHELL_TYPE" == "bash" ]]; then
    if [[ "$OS_NAME" == "macos" ]]; then
        RC_FILE="$HOME/.bash_profile"
    else
        RC_FILE="$HOME/.bashrc"
    fi
else
    RC_FILE="$HOME/.profile"
fi

# Créer un alias ou ajouter au PATH
ALIZE_ALIAS="alias alize='node $SCRIPT_DIR/alize.mjs'"

if ! grep -q "alias alize=" "$RC_FILE" 2>/dev/null; then
    echo "" >> "$RC_FILE"
    echo "# Alizé - Assistant IA français" >> "$RC_FILE"
    echo "$ALIZE_ALIAS" >> "$RC_FILE"
    success "Alias ajouté à $RC_FILE"
else
    info "Alias alize déjà configuré"
fi

# Aussi créer un lien symbolique si possible
if [[ -d "/usr/local/bin" ]] && [[ -w "/usr/local/bin" ]]; then
    cat > /usr/local/bin/alize << EOF
#!/bin/bash
exec node "$SCRIPT_DIR/alize.mjs" "\$@"
EOF
    chmod +x /usr/local/bin/alize
    success "Commande alize installée dans /usr/local/bin"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# FINALISATION
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}${BOLD}🎉 Installation d'Alizé terminée!${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}Prochaines étapes:${NC}"
echo ""
echo -e "  1. ${CYAN}source $RC_FILE${NC}     (recharger le shell)"
echo -e "  2. ${CYAN}alize onboard${NC}       (configuration guidée)"
echo -e "  3. ${CYAN}alize daemon start${NC}  (démarrer le serveur)"
echo ""
echo -e "${BOLD}Commandes utiles:${NC}"
echo ""
echo -e "  ${CYAN}alize --help${NC}         Afficher l'aide"
echo -e "  ${CYAN}alize doctor${NC}         Vérifier l'installation"
echo -e "  ${CYAN}alize dashboard${NC}      Ouvrir l'interface web"
echo ""
echo -e "${BOLD}💡 Astuce:${NC} Utilisez Gemini 2.5 Flash (gratuit) pour commencer!"
echo -e "   Obtenez votre clé: ${BLUE}https://aistudio.google.com/apikey${NC}"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Demander si l'utilisateur veut démarrer le daemon
echo ""
read -p "Voulez-vous démarrer Alizé maintenant? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    info "Démarrage d'Alizé..."
    
    # Charger l'alias pour cette session
    source "$RC_FILE" 2>/dev/null || true
    
    # Démarrer le daemon
    node "$SCRIPT_DIR/alize.mjs" daemon start &
    DAEMON_PID=$!
    
    sleep 2
    
    if kill -0 $DAEMON_PID 2>/dev/null; then
        success "Alizé démarré! (PID: $DAEMON_PID)"
        
        # Ouvrir le navigateur si possible
        if command -v open &> /dev/null; then
            sleep 1
            open "http://127.0.0.1:18789" 2>/dev/null || true
        elif command -v xdg-open &> /dev/null; then
            sleep 1
            xdg-open "http://127.0.0.1:18789" 2>/dev/null || true
        fi
    else
        warning "Le daemon ne semble pas avoir démarré correctement."
        echo "Essayez: alize daemon start"
    fi
else
    info "Vous pouvez démarrer Alizé plus tard avec: alize daemon start"
fi

echo ""
echo -e "${GREEN}Merci d'avoir installé Alizé! 🌬️${NC}"
echo ""
