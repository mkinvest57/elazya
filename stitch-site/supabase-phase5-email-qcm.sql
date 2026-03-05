-- Phase 5 migration — QCM answers and Email Sequence Tracking

-- Add QCM response columns
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS qcm_role TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS qcm_hours TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS qcm_interest TEXT;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS qcm_plan TEXT;

-- Add tracking columns for the email sequence
-- mail1 is sent immediately via the waitlist API route, so we don't need a flag for it
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS mail2_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS mail3_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS mail4_sent BOOLEAN DEFAULT FALSE;

-- Ensure position is properly set up if it wasn't already
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS position INTEGER;

-- Make existing update policies cover the new columns
-- (The existing "Allow anon update waitlist" and "Allow service role update" cover these)
