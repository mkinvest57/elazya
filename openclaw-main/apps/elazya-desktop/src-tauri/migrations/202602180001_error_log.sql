CREATE TABLE IF NOT EXISTS error_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT
);
