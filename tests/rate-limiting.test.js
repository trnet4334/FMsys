import test from 'node:test';
import assert from 'node:assert/strict';
import { createAuthService } from '../apps/api/src/authService.js';
import { loadAuthConfig } from '../apps/api/src/authConfig.js';

// Rate limiting and lockout tests use the in-memory loginRecovery path
// which shares the same in-memory rate limiter and lockout logic

const defaultConfig = loadAuthConfig();
const LOCKOUT_THRESHOLD = defaultConfig.security.lockoutThreshold;
const RATE_LIMIT_MAX_PER_IP = defaultConfig.security.rateLimitMaxPerIp;

test('5 failed login attempts lock the account', async () => {
  const svc = createAuthService();
  // Use a fake email (not in recoveryUsers) to test lockout counter
  const email = 'lockout-test@fmsys.local';

  // Hit threshold with wrong password — each call increments fails
  for (let i = 0; i < LOCKOUT_THRESHOLD; i++) {
    svc.loginRecovery({ email, password: 'wrong', sourceIp: '127.0.0.1' });
  }
  const result = svc.loginRecovery({ email, password: 'wrong', sourceIp: '127.0.0.1' });
  assert.equal(result.ok, false);
  assert.equal(result.status, 423);
  assert.equal(result.error, 'account_locked');
  assert.ok(result.lockedUntil);
});

test('locked account cannot login even with correct credentials', async () => {
  const svc = createAuthService();

  // Lock recovery user
  for (let i = 0; i < LOCKOUT_THRESHOLD; i++) {
    svc.loginRecovery({ email: 'recovery@fmsys.local', password: 'wrong', sourceIp: '127.0.0.1' });
  }
  const result = svc.loginRecovery({ email: 'recovery@fmsys.local', password: 'recovery-only', sourceIp: '127.0.0.1' });
  assert.equal(result.ok, false);
  assert.equal(result.status, 423);
  assert.equal(result.error, 'account_locked');
});

test('IP rate limit throttles after too many requests', async () => {
  const svc = createAuthService();
  const ip = '10.0.0.99';

  let throttled = false;
  for (let i = 0; i <= RATE_LIMIT_MAX_PER_IP + 1; i++) {
    const result = svc.loginRecovery({ email: `user${i}@fmsys.local`, password: 'x', sourceIp: ip });
    if (result.status === 429) { throttled = true; break; }
  }
  assert.ok(throttled, 'should have been rate limited after too many requests from same IP');
});
