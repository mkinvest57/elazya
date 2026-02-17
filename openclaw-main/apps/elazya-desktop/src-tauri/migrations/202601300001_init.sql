CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tool_name TEXT NOT NULL,
    args TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL,
    result TEXT,
    start_time INTEGER NOT NULL,
    end_time INTEGER
);
