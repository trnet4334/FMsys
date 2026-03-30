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

test('register creates pending_verification user and sends email', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `reg-${Date.now()}@test.com`;
  const result = await auth.register({ email });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 1);
  assert.equal(emailCalls[0].method, 'verify');
  assert.equal(emailCalls[0].email, email);
});

test('register rejects duplicate email', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `dup-${Date.now()}@test.com`;
  await auth.register({ email });
  emailCalls.length = 0;
  const result = await auth.register({ email });
  assert.equal(result.ok, false);
});

test('verifyEmail activates token and sets email_verified', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `ve-${Date.now()}@test.com`;
  await auth.register({ email });
  const tokenValue = emailCalls[0].token;
  const result = await auth.verifyEmail({ token: tokenValue });
  assert.equal(result.ok, true);
  assert.ok(result.setupToken);
});

test('setupPassword sets hash and activates account', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `sp-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const result = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  assert.equal(result.ok, true);
  assert.ok(result.sessionId);
});
