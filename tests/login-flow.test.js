import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail() {},
  async sendNewDeviceAlert() {},
};

test.after(() => pool.end());
test.beforeEach(() => { emailCalls.length = 0; });

// Helper: create an active user that has completed registration + password setup
async function createActiveUser(auth) {
  const email = `login-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  return email;
}

test('login with correct password returns pre_mfa session', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, true);
  assert.equal(result.sessionState, 'pre_mfa');
  assert.ok(result.sessionId);
});

test('login with wrong password returns error', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const result = await auth.login({ email, password: 'WrongPass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
});

test('5 failed logins lock account for 15 minutes', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  for (let i = 0; i < 5; i++) {
    await auth.login({ email, password: 'WrongPass!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  }
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  assert.equal(result.ok, false);
  assert.match(result.error, /locked/i);
});

test('getSession returns session state', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const { sessionId } = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  const session = await auth.getSessionDb(sessionId);
  assert.ok(session);
  assert.equal(session.session_state, 'pre_mfa');
});

test('logout deletes session', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = await createActiveUser(auth);
  const { sessionId } = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test/1.0' });
  await auth.logoutDb(sessionId);
  const session = await auth.getSessionDb(sessionId);
  assert.equal(session, null);
});
