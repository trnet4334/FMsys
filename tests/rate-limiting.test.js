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

test('5 failed login attempts lock the account', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `ratelimit-${Date.now()}@test.com`;
  // Register user
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });

  // 5 wrong attempts
  for (let i = 0; i < 5; i++) {
    await auth.login({ email, password: 'WrongPass!', sourceIp: '127.0.0.1', userAgent: 'Test' });
  }

  // Correct password should now fail due to lockout
  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test' });
  assert.equal(result.ok, false);
  assert.match(result.error, /locked/i);
});

test('locked account cannot login', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const email = `locked-${Date.now()}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });

  for (let i = 0; i < 5; i++) {
    await auth.login({ email, password: 'Bad!', sourceIp: '127.0.0.1', userAgent: 'Test' });
  }

  const result = await auth.login({ email, password: 'SecurePass123!', sourceIp: '127.0.0.1', userAgent: 'Test' });
  assert.equal(result.ok, false);
});
