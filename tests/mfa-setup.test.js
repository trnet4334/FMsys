import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail(email, token) { emailCalls.push({ method: 'reset', email, token }); },
  async sendNewDeviceAlert() {},
};

const testConfig = {
  session: { ttlMs: 86_400_000, idleMs: 1_800_000 },
  security: { lockoutThreshold: 5, lockoutMs: 900_000, rateLimitMaxPerIp: 100, rateLimitMaxPerAccount: 10, rateLimitWindowMs: 60_000 },
};

test.after(() => pool?.end());
test.beforeEach(() => { emailCalls.length = 0; });

async function createUserWithSession(auth) {
  const email = `mfa-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const { sessionId } = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  return { email, sessionId };
}

test('setupMfa returns qrDataUrl and 8 recovery codes', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const { sessionId } = await createUserWithSession(auth);
  const result = await auth.setupMfa({ sessionId });
  assert.equal(result.ok, true);
  assert.ok(result.qrDataUrl);
  assert.equal(result.recoveryCodes.length, 8);
  assert.match(result.recoveryCodes[0], /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

test('forgotPassword sends reset email (always ok)', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `fp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  emailCalls.length = 0;

  const result = await auth.forgotPassword({ email });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 1);
  assert.equal(emailCalls[0].method, 'reset');
});

test('forgotPassword returns ok even for non-existent email (enumeration prevention)', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const result = await auth.forgotPassword({ email: 'nobody@test.com' });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 0); // No email sent
});

test('resetPassword updates password and revokes all sessions', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `rp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const { sessionId } = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  emailCalls.length = 0;

  await auth.forgotPassword({ email });
  const resetToken = emailCalls[0].token;
  emailCalls.length = 0;

  const result = await auth.resetPassword({ token: resetToken, password: 'NewSecurePass456!' });
  assert.equal(result.ok, true);

  // Original session should be revoked
  const session = await auth.getSessionDb(sessionId);
  assert.equal(session, null);
});
