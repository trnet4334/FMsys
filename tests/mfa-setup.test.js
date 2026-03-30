import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
const emailCalls = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailCalls.push({ method: 'verify', email, token }); },
  async sendPasswordResetEmail(email, token) { emailCalls.push({ method: 'reset', email, token }); },
  async sendNewDeviceAlert() {},
};

test.after(() => pool.end());
test.beforeEach(() => { emailCalls.length = 0; });

// Helper: register + verify email + setup password → returns { sessionId, email }
async function createUserWithPassword(auth) {
  const email = `mfa-${Date.now()}-${Math.random().toString(36).slice(2)}@test.com`;
  await auth.register({ email });
  const { setupToken } = await auth.verifyEmail({ token: emailCalls[0].token });
  emailCalls.length = 0;
  const { sessionId } = await auth.setupPassword({ token: setupToken, password: 'SecurePass123!' });
  return { sessionId, email };
}

test('setupMfa returns QR data and 8 recovery codes', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { sessionId } = await createUserWithPassword(auth);
  const result = await auth.setupMfa({ sessionId });
  assert.equal(result.ok, true);
  assert.ok(result.qrDataUrl);
  assert.equal(result.recoveryCodes.length, 8);
  assert.match(result.recoveryCodes[0], /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

test('forgotPassword always returns ok (prevents enumeration)', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const result = await auth.forgotPassword({ email: 'nonexistent@test.com' });
  assert.equal(result.ok, true);
});

test('forgotPassword sends email for existing user', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email } = await createUserWithPassword(auth);
  emailCalls.length = 0;
  const result = await auth.forgotPassword({ email });
  assert.equal(result.ok, true);
  assert.equal(emailCalls.length, 1);
  assert.equal(emailCalls[0].method, 'reset');
});

test('resetPassword updates hash and revokes all sessions', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email, sessionId } = await createUserWithPassword(auth);
  emailCalls.length = 0;
  await auth.forgotPassword({ email });
  const resetToken = emailCalls[0].token;
  const result = await auth.resetPassword({ token: resetToken, password: 'NewSecurePass456!' });
  assert.equal(result.ok, true);
  // Old session should be invalid
  const oldSession = await auth.getSessionDb(sessionId);
  assert.equal(oldSession, null);
});
