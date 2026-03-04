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
