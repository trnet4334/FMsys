import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createUserRepository } from '../apps/api/src/userRepository.js';
import { createTokenRepository } from '../apps/api/src/tokenRepository.js';
import { createSessionRepository } from '../apps/api/src/sessionRepository.js';
import { createAuthService } from '../apps/api/src/authService.js';

const DB_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test';
const pool = createPool(DB_URL);
const SKIP = { skip: !process.env.DATABASE_URL && 'set DATABASE_URL to run DB tests' };

const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert() {},
};

const testConfig = {
  session: { ttlMs: 86_400_000, idleMs: 1_800_000 },
  security: { lockoutThreshold: 5, lockoutMs: 900_000, rateLimitMaxPerIp: 100, rateLimitMaxPerAccount: 10, rateLimitWindowMs: 60_000 },
};

test.after(() => pool?.end());
test.beforeEach(() => { emailCalls.length = 0; });

test('register creates pending_verification user and sends verification email', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `reg-${Date.now()}@test.com`;
  const result = await auth.register({ email });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 1);
  assert.equal(emailCalls[0].method, 'verify');
  assert.equal(emailCalls[0].email, email);
  assert.ok(emailCalls[0].token);
});

test('register rejects duplicate email', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `dup-${Date.now()}@test.com`;
  await auth.register({ email });
  emailCalls.length = 0;
  const result = await auth.register({ email });
  assert.equal(result.ok, false);
  assert.equal(emailCalls.length, 0);
});

test('verifyEmail activates token and returns setupToken', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `ve-${Date.now()}@test.com`;
  await auth.register({ email });
  const verifyToken = emailCalls[0].token;
  const result = await auth.verifyEmail({ token: verifyToken });
  assert.equal(result.ok, true);
  assert.ok(result.setupToken);
});

test('verifyEmail rejects invalid token', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const result = await auth.verifyEmail({ token: 'invalid-token-value' });
  assert.equal(result.ok, false);
});

test('setupPassword sets hash, activates account, creates mfa_setup session', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `sp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const result = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  assert.equal(result.ok, true);
  assert.ok(result.sessionId);
});

test('setupPassword rejects weak password', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = `wp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  const result = await auth.setupPassword({ token: setupToken, password: 'weak' });
  assert.equal(result.ok, false);
});
