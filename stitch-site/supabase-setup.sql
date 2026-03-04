-- Run this in Supabase Dashboard > SQL Editor
-- Project: rrzenknvvssbwkozikcw

-- 1. Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'solo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Config table (compteur places)
CREATE TABLE IF NOT EXISTS config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- 3. Init places counter
INSERT INTO config (key, value)
VALUES ('places_restantes', '47')
ON CONFLICT (key) DO NOTHING;

-- 4. Enable Row Level Security + public access for anon key
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON waitlist
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon read" ON config
  FOR SELECT TO anon USING (true);
