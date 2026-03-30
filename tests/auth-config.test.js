import test from 'node:test';
import assert from 'node:assert/strict';

import { loadAuthConfig } from '../apps/api/src/authConfig.js';

test('loadAuthConfig reads env values and applies defaults', () => {
  const config = loadAuthConfig({
    OAUTH_GOOGLE_CLIENT_ID: 'g-id',
    SESSION_SIGNING_KEY: 'session-key',
    MFA_ISSUER: 'FMsys Test',
    AUTH_LOCKOUT_THRESHOLD: '3',
  });

  assert.equal(config.oauth.googleClientId, 'g-id');
  assert.equal(config.session.secret, 'session-key');
  assert.equal(config.mfa.issuer, 'FMsys Test');
  assert.equal(config.security.lockoutThreshold, 3);
  assert.equal(config.oauth.appleClientId, 'apple-dev-client');
});

test('defaults are sensible when no env vars set', () => {
  const config = loadAuthConfig({});
  assert.equal(config.database.url, 'postgresql://localhost:5432/fmsys');
  assert.equal(config.webauthn.rpId, 'localhost');
  assert.equal(config.session.idleMs, 1800000);
  assert.ok(config.app.allowedOrigins.includes('http://localhost:4010'));
  assert.ok(typeof config.resend.apiKey === 'string');
  assert.ok(typeof config.resend.emailFrom === 'string');
});

test('env vars override defaults', () => {
  const config = loadAuthConfig({
    DATABASE_URL: 'postgresql://prod:5432/fmsys',
    WEBAUTHN_RP_ID: 'fmsys.app',
    AUTH_SESSION_IDLE_MS: '3600000',
    RESEND_API_KEY: 'test-key',
  });
  assert.equal(config.database.url, 'postgresql://prod:5432/fmsys');
  assert.equal(config.webauthn.rpId, 'fmsys.app');
  assert.equal(config.session.idleMs, 3600000);
  assert.equal(config.resend.apiKey, 'test-key');
});
