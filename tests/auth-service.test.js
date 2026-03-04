import test from 'node:test';
import assert from 'node:assert/strict';

import { createAuthService } from '../apps/api/src/authService.js';

test('oauth callback creates pre_mfa session and mfa verification elevates session', () => {
  const service = createAuthService();
  const start = service.startOAuth({ provider: 'google', redirectUri: 'http://localhost/login' });
  assert.equal(start.ok, true);

  const callback = service.handleOAuthCallback({
    provider: 'google',
    code: 'demo',
    state: start.state,
    sourceIp: '127.0.0.1',
  });

  assert.equal(callback.ok, true);
  assert.equal(callback.session.state, 'pre_mfa');

  const code = service._internals.getMfaCodeForSessionTesting(callback.session.sessionId);
  const verified = service.verifyMfa({
    sessionId: callback.session.sessionId,
    code,
    sourceIp: '127.0.0.1',
  });

  assert.equal(verified.ok, true);
  assert.equal(verified.session.state, 'authenticated');
});

test('recovery login lockout triggers after repeated failures', () => {
  const service = createAuthService();
  let last;

  for (let i = 0; i < 5; i += 1) {
    last = service.loginRecovery({
      email: 'recovery@fmsys.local',
      password: 'wrong',
      sourceIp: '127.0.0.1',
    });
  }

  assert.equal(last.error, 'account_locked');
  assert.equal(last.status, 423);
});
