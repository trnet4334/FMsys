-- 003_auth_production_schema.sql
-- Extends 002_auth_gateway_schema.sql for production auth system

-- Extend user_auth_profiles
ALTER TABLE user_auth_profiles
  ADD COLUMN IF NOT EXISTS password_hash    TEXT,
  ADD COLUMN IF NOT EXISTS email_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS account_status   TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (account_status IN ('pending_verification', 'active', 'suspended')),
  ADD COLUMN IF NOT EXISTS failed_attempts  INTEGER NOT NULL DEFAULT 0;

-- Update session_state CHECK to include mfa_setup
ALTER TABLE auth_sessions DROP CONSTRAINT IF EXISTS auth_sessions_session_state_check;
ALTER TABLE auth_sessions ADD CONSTRAINT auth_sessions_session_state_check
  CHECK (session_state IN ('pre_mfa', 'mfa_setup', 'authenticated'));

-- Add session columns
ALTER TABLE auth_sessions
  ADD COLUMN IF NOT EXISTS ip_address      INET,
  ADD COLUMN IF NOT EXISTS user_agent      TEXT,
  ADD COLUMN IF NOT EXISTS device_label    TEXT,
  ADD COLUMN IF NOT EXISTS last_active_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS idle_timeout_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 minutes';

-- Auth tokens (verification, password reset, password setup)
CREATE TABLE IF NOT EXISTS auth_tokens (
  token_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_value     TEXT NOT NULL UNIQUE,
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  token_type      TEXT NOT NULL
    CHECK (token_type IN ('email_verification', 'password_setup', 'password_reset')),
  expires_at      TIMESTAMPTZ NOT NULL,
  consumed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_value ON auth_tokens(token_value);
CREATE INDEX IF NOT EXISTS idx_auth_tokens_user ON auth_tokens(user_id);

-- Recovery codes (MFA backup)
CREATE TABLE IF NOT EXISTS recovery_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  code_hash       TEXT NOT NULL,
  consumed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recovery_codes_user ON recovery_codes(user_id);

-- Extend webauthn_credentials
ALTER TABLE webauthn_credentials
  ADD COLUMN IF NOT EXISTS device_name   TEXT,
  ADD COLUMN IF NOT EXISTS last_used_at  TIMESTAMPTZ;

-- Known devices (anomaly detection)
CREATE TABLE IF NOT EXISTS known_devices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES user_auth_profiles(user_id),
  ip_subnet       TEXT NOT NULL,
  ua_family       TEXT NOT NULL,
  device_label    TEXT,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_known_devices_user ON known_devices(user_id);

-- Index for session queries by user_id
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id);

-- WebAuthn challenges
CREATE TABLE IF NOT EXISTS webauthn_challenges (
  challenge_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES user_auth_profiles(user_id),
  challenge       TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('registration', 'assertion')),
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
