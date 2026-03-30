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
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert() {},
};

const testConfig = {
  session: { ttlMs: 86_400_000, idleMs: 1_800_000 },
  security: { lockoutThreshold: 5, lockoutMs: 900_000, rateLimitMaxPerIp: 100, rateLimitMaxPerAccount: 10, rateLimitWindowMs: 60_000 },
};

test.after(() => pool?.end());
test.beforeEach(() => { emailCalls.length = 0; });

// Helper: create a fully registered user (email verified, password set)
async function createActiveUser(auth, suffix = '') {
  const email = `login-${suffix}-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  return email;
}

test('login with correct password returns pre_mfa session', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth, 'correct');
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, true);
  assert.equal(result.sessionState, 'pre_mfa');
  assert.ok(result.sessionId);
});

test('login with wrong password returns error', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth, 'wrong');
  const result = await auth.login({ email, password: 'WrongPass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
});

test('login with non-existent email returns error', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const result = await auth.login({ email: 'nobody@test.com', password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
});

test('5 failed logins lock account', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth, 'lockout');
  for (let i = 0; i < 5; i++) {
    await auth.login({ email, password: 'Wrong!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  }
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
  assert.match(result.error ?? '', /locked/i);
});

test('getSession returns session state for valid session', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth, 'getsess');
  const loginResult = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  const session = await auth.getSessionDb(loginResult.sessionId);
  assert.ok(session);
  assert.equal(session.session_state, 'pre_mfa');
});

test('logout deletes session', SKIP, async () => {
  const auth = createAuthService({ config: testConfig, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth, 'logout');
  const loginResult = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  await auth.logoutDb(loginResult.sessionId);
  const session = await auth.getSessionDb(loginResult.sessionId);
  assert.equal(session, null);
});
