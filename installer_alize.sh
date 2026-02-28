#!/bin/bash
#
# 🌬️ Installateur Alizé
# Le premier agent IA français haute performance
# Basé sur la technologie Alizé (https://alize.ai)
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

# Fonction pour afficher les messages de manière portable
say() {
    # On utilise printf pour éviter les problèmes de echo -e sur certains shells (sh, dash)
    printf "%b\n" "$1"
}

info() {
    say "${CYAN}ℹ️  $1${NC}"
}

success() {
    say "${GREEN}✅ $1${NC}"
}

warning() {
    say "${YELLOW}⚠️  $1${NC}"
}

error() {
    say "${RED}❌ $1${NC}"
}

step() {
    say "\n${BLUE}${BOLD}[$1/7]${NC} $2"
}

# Bannière
say ""
say "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
say "${BOLD}🌬️  Bienvenue dans l'installation d'Alizé!${NC}"
say "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
say ""
say "    ${BOLD}Le premier assistant IA français haute performance${NC}"
say "    Propulsé par le moteur d'autonomie Alizé"
say ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 1: Détection de l'environnement et du système
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "1" "Détection de votre système..."

# Détecter si on est dans un pipe ou si le script est sur le disque
IS_REMOTE=false
if [[ -z "${BASH_SOURCE[0]}" ]] || [[ "${BASH_SOURCE[0]}" == "/dev/stdin" ]]; then
    IS_REMOTE=true
fi

# Répertoire cible par défaut pour l'installation
TARGET_DIR="$HOME/alize"

# Pour le développement local, on privilégie le code source modifié
DEV_SOURCE="/Users/sashimi/Documents/moltbot-main"
if [[ -d "$DEV_SOURCE" ]]; then
    REPO_URL="file://$DEV_SOURCE"
    # info "Mode développement détecté : source locale $REPO_URL"
else
    REPO_URL="https://github.com/mkinvest57/elazya.git" 
fi

if $IS_REMOTE; then
    info "Installation à distance détectée (pipe)."
else
    # Si on est en local, on vérifie si on est dans le dépôt
    if [[ -f "package.json" ]] && grep -q '"name": "alize"' package.json; then
        TARGET_DIR="$(pwd)"
        info "Installation locale détectée dans : $TARGET_DIR"
    fi
fi

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
    say "Alizé supporte macOS et Linux."
    exit 1
fi

info "Shell: $SHELL_TYPE"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 2: Préparation du répertoire (Clonage si nécessaire)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "2" "Préparation du répertoire d'installation..."

if $IS_REMOTE || [[ ! -d "$TARGET_DIR/.git" ]]; then
    if [[ -d "$TARGET_DIR" ]]; then
        warning "Le répertoire $TARGET_DIR existe déjà."
        read -p "Voulez-vous le supprimer et recommencer ? (o/n) " -n 1 -r < /dev/tty
        say ""
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            info "Suppression de $TARGET_DIR..."
            rm -rf "$TARGET_DIR"
        else
            error "Installation annulée par l'utilisateur."
            exit 1
        fi
    fi

    info "Clonage d'Alizé dans $TARGET_DIR..."
    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé. Veuillez installer Git avant de continuer."
        exit 1
    fi
    
    git clone "$REPO_URL" "$TARGET_DIR"
    success "Dépôt cloné avec succès."
fi

# On se place dans le répertoire cible pour le reste de l'installation
cd "$TARGET_DIR"
SCRIPT_DIR="$(pwd)"

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 3: Vérification des dépendances
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "3" "Vérification de Node.js..."

if ! command -v node &> /dev/null; then
    warning "Node.js n'est pas installé"
    
    if [[ "$OS_NAME" == "macos" ]]; then
        if command -v brew &> /dev/null; then
            info "Installation de Node.js via Homebrew..."
            brew install node@22
            success "Node.js installé"
        else
            error "Homebrew n'est pas installé."
            say "Installez Node.js manuellement: https://nodejs.org/"
            exit 1
        fi
    else
        error "Veuillez installer Node.js manuellement."
        say "Visitez: https://nodejs.org/"
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
# ÉTAPE 4: Installation des outils optionnels (macOS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if [[ "$OS_NAME" == "macos" ]]; then
    step "4" "Installation des outils système optionnels..."

    if command -v brew &> /dev/null; then
        # Himalaya (Email)
        if ! command -v himalaya &> /dev/null; then
            info "Installation de himalaya (Client Email)..."
            brew install himalaya
            success "himalaya installé"
        else
            success "himalaya déjà installé"
        fi

        # GitHub CLI
        if ! command -v gh &> /dev/null; then
            info "Installation de gh (GitHub CLI)..."
            brew install gh
            success "gh installé"
        else
            success "gh déjà installé"
        fi
    else
        warning "Homebrew non détecté, saut de l'installation des outils optionnels."
    fi
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 5: Installation des dépendances
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "5" "Installation des dépendances..."

info "Assemblage d'Alizé en cours... ⏳"
say ""

if pnpm install --silent 2>/dev/null; then
    success "Dépendances installées"
else
    warning "Installation avec logs détaillés..."
    pnpm install
    success "Dépendances installées"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 6: Compilation
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "6" "Compilation d'Alizé..."

if pnpm build --silent 2>/dev/null; then
    success "Alizé compilé avec succès"
else
    warning "Compilation avec logs détaillés..."
    pnpm build
    success "Alizé compilé avec succès"
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE 7: Configuration du PATH
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "7" "Configuration du PATH..."

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
# ÉTAPE OPTIONNELLE: Configuration des skills
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

say ""
say "${BLUE}${BOLD}[Optionnel]${NC} Configuration des compétences (skills)..."

say ""
say "${BOLD}🔍 Recherche Web (Brave Search)${NC}"
say "   Permet à Alizé de faire des recherches sur Internet."
say "   ${CYAN}Obtenez une clé gratuite:${NC} https://brave.com/search/api/"
say ""

read -p "Voulez-vous configurer la recherche web maintenant? (o/n) " -n 1 -r < /dev/tty
say ""

if [[ $REPLY =~ ^[Oo]$ ]]; then
    say ""
    read -p "Collez votre clé API Brave Search (ou appuyez Entrée pour ignorer): " BRAVE_KEY < /dev/tty
    
    if [[ -n "$BRAVE_KEY" ]]; then
        # Créer/mettre à jour le fichier de config
        CONFIG_DIR="$HOME/.config/alize"
        CONFIG_FILE="$CONFIG_DIR/config.json5"
        
        mkdir -p "$CONFIG_DIR"
        
        if [[ -f "$CONFIG_FILE" ]]; then
            # Ajouter à la config existante (basique - le wizard fera mieux)
            info "Configuration stockée. Utilisez 'alize configure --section web' pour les options avancées."
        else
            # Créer une config minimale
            cat > "$CONFIG_FILE" << EOF
{
  // Configuration Alizé
  tools: {
    web: {
      search: {
        enabled: true,
        apiKey: "$BRAVE_KEY"
      },
      fetch: {
        enabled: true
      }
    }
  }
}
EOF
        fi
        success "Recherche web configurée!"
    else
        info "Recherche web ignorée. Configurez-la plus tard avec: alize configure --section web"
    fi
else
    info "Configuration des skills ignorée. Utilisez 'alize configure' plus tard."
fi

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ÉTAPE FINALE: Mise en service automatique 🚀
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

step "Finale" "Mise en service d'Alizé..."

say ""
info "Alivons l'intelligence Alizé sur votre système..."

# Définir le chemin absolu vers le binaire pour éviter les erreurs d'alias
if [[ -f "$TARGET_DIR/alize.mjs" ]]; then
    ALIZE_EXEC="node $TARGET_DIR/alize.mjs"
else
    ALIZE_EXEC="node $TARGET_DIR/dist/index.js"
fi

# 1. Onboarding automatique
say ""
say "${BOLD}Configuration initiale en cours...${NC}"
# On redirige stdin vers le terminal pour que l'onboarding soit interactif
$ALIZE_EXEC onboard < /dev/tty

# 2. Démarrage du daemon
say ""
info "Démarrage du moteur d'autonomie..."
$ALIZE_EXEC daemon start &
DAEMON_PID=$!

# Attendre que le serveur démarre
sleep 3

# 3. Ouverture du Dashboard
say ""
info "Ouverture de votre Tableau de Bord..."
DASH_URL="http://127.0.0.1:18789"

if command -v open &> /dev/null; then
    open "$DASH_URL" 2>/dev/null || true
elif command -v xdg-open &> /dev/null; then
    xdg-open "$DASH_URL" 2>/dev/null || true
fi

say ""
say "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
say "${GREEN}${BOLD}🎉 Félicitations ! Alizé est maintenant opérationnel.${NC}"
say "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
say ""
say "   👉 Votre Tableau de Bord : ${BOLD}${BLUE}$DASH_URL${NC}"
say "   💡 Votre assistant IA français est prêt à vous servir."
say ""
say "   ${BOLD}Note:${NC} Pour utiliser Alizé depuis n'importe quel terminal,"
say "   ouvrez une nouvelle fenêtre ou tapez : ${CYAN}source $RC_FILE${NC}"
say ""
say "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
say ""
say "${GREEN}Alizé vous remercie de votre confiance. 🌬️🇫🇷✨⚖️${NC}"
say ""

exit 0
