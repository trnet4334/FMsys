-- Core schema for personal-finance-dashboard-v2

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name VARCHAR(120) NOT NULL,
  institution VARCHAR(120) NOT NULL,
  account_type VARCHAR(32) NOT NULL,
  base_currency VARCHAR(10) NOT NULL DEFAULT 'TWD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_date DATE NOT NULL,
  snapshot_type VARCHAR(16) NOT NULL,
  total_assets NUMERIC(20, 4) NOT NULL,
  total_liabilities NUMERIC(20, 4) NOT NULL DEFAULT 0,
  net_worth NUMERIC(20, 4) NOT NULL,
  exchange_rates JSONB NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, snapshot_date, snapshot_type)
);

CREATE TABLE IF NOT EXISTS snapshot_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  asset_category VARCHAR(16) NOT NULL,
  asset_name VARCHAR(120) NOT NULL,
  account_id UUID REFERENCES accounts(id),
  quantity NUMERIC(24, 8) NOT NULL,
  unit_cost NUMERIC(24, 8),
  current_price NUMERIC(24, 8),
  currency VARCHAR(10) NOT NULL,
  market_value_local NUMERIC(24, 8) NOT NULL,
  market_value_base NUMERIC(24, 8) NOT NULL,
  unrealized_pnl NUMERIC(24, 8) NOT NULL DEFAULT 0,
  weight_pct NUMERIC(8, 4),
  extra JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS snapshot_diffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_id UUID NOT NULL REFERENCES snapshots(id) ON DELETE CASCADE,
  prev_snapshot_id UUID REFERENCES snapshots(id),
  net_worth_change NUMERIC(20, 4) NOT NULL,
  net_worth_change_pct NUMERIC(10, 6),
  category_changes JSONB NOT NULL DEFAULT '{}'::jsonb,
  new_holdings JSONB NOT NULL DEFAULT '[]'::jsonb,
  removed_holdings JSONB NOT NULL DEFAULT '[]'::jsonb,
  anomalies JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (snapshot_id)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date
  ON snapshots (user_id, snapshot_date DESC);

CREATE INDEX IF NOT EXISTS idx_snapshot_holdings_snapshot_category
  ON snapshot_holdings (snapshot_id, asset_category);

CREATE INDEX IF NOT EXISTS idx_snapshot_diffs_snapshot_prev
  ON snapshot_diffs (snapshot_id, prev_snapshot_id);
