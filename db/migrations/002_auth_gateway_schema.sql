-- Auth gateway schema for add-secure-login-gateway

CREATE TABLE IF NOT EXISTS user_auth_profiles (
  user_id UUID PRIMARY KEY,
  primary_email VARCHAR(255) NOT NULL UNIQUE,
  auth_provider VARCHAR(32) NOT NULL,
  provider_user_id VARCHAR(255),
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  mfa_secret TEXT,
  lockout_count INT NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_state VARCHAR(32) NOT NULL CHECK (session_state IN ('pre_mfa', 'authenticated')),
  auth_method VARCHAR(32) NOT NULL,
  provider VARCHAR(32),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  elevated_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS auth_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type VARCHAR(64) NOT NULL,
  outcome VARCHAR(32),
  source_ip VARCHAR(64),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id VARCHAR(255) NOT NULL UNIQUE,
  public_key TEXT,
  sign_count BIGINT NOT NULL DEFAULT 0,
  transports JSONB NOT NULL DEFAULT '[]'::jsonb,
  attestation_format VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_state ON auth_sessions (user_id, session_state);
CREATE INDEX IF NOT EXISTS idx_auth_audit_events_user_created ON auth_audit_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_auth_profiles_locked_until ON user_auth_profiles (locked_until);
