CREATE TABLE IF NOT EXISTS agent_config (
    agent_id TEXT PRIMARY KEY,
    enabled  INTEGER NOT NULL DEFAULT 0,
    settings TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS agent_log (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id  TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    status    TEXT NOT NULL,
    summary   TEXT NOT NULL,
    details   TEXT DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_agent_log_agent ON agent_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_log_time ON agent_log(timestamp DESC);
