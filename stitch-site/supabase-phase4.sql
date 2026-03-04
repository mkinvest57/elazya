-- Phase 4 migration — Run in Supabase SQL Editor
-- Adds payment tracking columns to waitlist table

-- Add new columns
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS position INTEGER;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Allow anon to read waitlist (for position lookup on /merci)
CREATE POLICY "Allow anon select waitlist" ON waitlist
  FOR SELECT TO anon USING (true);

-- Allow service role to update waitlist (webhook uses supabase client)
CREATE POLICY "Allow anon update waitlist" ON waitlist
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Allow anon to update config (webhook decrements counter)
CREATE POLICY "Allow anon update config" ON config
  FOR UPDATE TO anon USING (true) WITH CHECK (true);
