-- Smart Resort 360 — User Management
-- Adds what's needed for RESORT_MANAGER to manage Operations Manager accounts
-- (Manager > Settings > User Management, previously fully hardcoded).

ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
