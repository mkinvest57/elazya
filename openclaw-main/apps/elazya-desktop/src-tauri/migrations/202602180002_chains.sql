-- Chains: core chain definitions and state
CREATE TABLE IF NOT EXISTS chains (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '⚡',
    enabled INTEGER NOT NULL DEFAULT 0,
    config TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Chain execution logs
CREATE TABLE IF NOT EXISTS chain_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id TEXT NOT NULL,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'info',
    FOREIGN KEY (chain_id) REFERENCES chains(id)
);

-- Chain metrics (one row per chain)
CREATE TABLE IF NOT EXISTS chain_metrics (
    chain_id TEXT PRIMARY KEY,
    total_executions INTEGER NOT NULL DEFAULT 0,
    total_time_saved_minutes INTEGER NOT NULL DEFAULT 0,
    last_run TEXT,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (chain_id) REFERENCES chains(id)
);

-- Seed the 3 starter chains
INSERT OR IGNORE INTO chains (id, name, description, icon, enabled) VALUES
    ('facturation', 'Gestion Facturation', 'Détecte vos factures PDF, les classe, rappelle les échéances, prépare les relances.', '📄', 0),
    ('email', 'Réponses Email', 'Analyse vos emails clients, génère des brouillons de réponse, trie les urgences.', '📧', 0),
    ('veille', 'Veille & Contenu', 'Surveille vos sources, résume les actus, suggère des angles de posts.', '🔍', 0);

INSERT OR IGNORE INTO chain_metrics (chain_id) VALUES
    ('facturation'),
    ('email'),
    ('veille');

-- User configuration (key/value store)
CREATE TABLE IF NOT EXISTS user_config (
    key TEXT PRIMARY KEY,
    value JSON
);
