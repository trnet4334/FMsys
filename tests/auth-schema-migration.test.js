import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = new URL('../db/migrations/002_auth_gateway_schema.sql', import.meta.url);

test('auth migration defines gateway and passkey readiness tables', () => {
  assert.equal(fs.existsSync(migrationPath), true, 'auth migration file should exist');
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();

  for (const table of ['user_auth_profiles', 'auth_sessions', 'auth_audit_events', 'webauthn_credentials']) {
    assert.match(sql, new RegExp(`create table if not exists ${table}`), `missing ${table}`);
  }

  assert.match(sql, /pre_mfa/);
  assert.match(sql, /authenticated/);
});
