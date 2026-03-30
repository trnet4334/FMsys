import test from 'node:test';
import assert from 'node:assert/strict';
import { createPool } from '../apps/api/src/db.js';
import { createAuthService } from '../apps/api/src/authService.js';

const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');

// Capture all email service calls
const emailLog = [];
const mockEmailService = {
  async sendVerificationEmail(email, token) { emailLog.push({ type: 'verify', email, token }); },
  async sendPasswordResetEmail(email, token) { emailLog.push({ type: 'reset', email, token }); },
  async sendNewDeviceAlert(email, details) { emailLog.push({ type: 'device_alert', email, details }); },
};

test.after(() => pool.end());
test.beforeEach(() => { emailLog.length = 0; });

// Helper: complete full registration flow and return the mfa_setup sessionId
async function completeRegistration(auth, emailSuffix) {
  const email = `e2e-${Date.now()}-${emailSuffix}@test.com`;

  // 1. Register
  const regResult = await auth.register({ email });
  assert.equal(regResult.ok, true, 'register should succeed');

  const verifyEntry = emailLog.find((e) => e.type === 'verify');
  assert.ok(verifyEntry?.token, 'verification email should be sent');
  emailLog.length = 0;

  // 2. Verify email → get setup token
  const verifyResult = await auth.verifyEmail({ token: verifyEntry.token });
  assert.equal(verifyResult.ok, true, 'verifyEmail should succeed');
  assert.ok(verifyResult.setupToken, 'should return setupToken');

  // 3. Setup password → get mfa_setup session
  const setupResult = await auth.setupPassword({ token: verifyResult.setupToken, password: 'SecurePass123!' });
  assert.equal(setupResult.ok, true, 'setupPassword should succeed');
  assert.ok(setupResult.sessionId, 'should return sessionId');
  emailLog.length = 0;

  return { email, sessionId: setupResult.sessionId };
}

test('complete registration flow: register → verify email → setup password', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { sessionId } = await completeRegistration(auth, 'reg');
  const session = await auth.getSessionDb(sessionId);
  assert.ok(session, 'session should exist');
  assert.equal(session.session_state, 'mfa_setup');
});

test('register rejects duplicate email', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email } = await completeRegistration(auth, 'dup');
  emailLog.length = 0;
  const dupResult = await auth.register({ email });
  assert.equal(dupResult.ok, false);
});

test('login returns pre_mfa session after registration', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email } = await completeRegistration(auth, 'login');
  emailLog.length = 0;
  const loginResult = await auth.login({ email, password: 'SecurePass123!', sourceIp: '10.0.0.1', userAgent: 'Chrome/Test' });
  assert.equal(loginResult.ok, true, 'login should succeed');
  assert.equal(loginResult.sessionState, 'pre_mfa');
  assert.ok(loginResult.sessionId);
});

test('wrong password is rejected', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email } = await completeRegistration(auth, 'badpw');
  emailLog.length = 0;
  const result = await auth.login({ email, password: 'WrongPass!', sourceIp: '10.0.0.1', userAgent: 'Chrome' });
  assert.equal(result.ok, false);
});

test('logout invalidates session', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email, sessionId: mfaSessionId } = await completeRegistration(auth, 'logout');
  emailLog.length = 0;

  const loginResult = await auth.login({ email, password: 'SecurePass123!', sourceIp: '10.0.0.1', userAgent: 'Chrome' });
  assert.equal(loginResult.ok, true);

  await auth.logoutDb(loginResult.sessionId);
  const session = await auth.getSessionDb(loginResult.sessionId);
  assert.equal(session, null, 'session should be null after logout');
});

test('forgot password + reset revokes all sessions', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { email, sessionId: mfaSessionId } = await completeRegistration(auth, 'reset');
  emailLog.length = 0;

  const loginResult = await auth.login({ email, password: 'SecurePass123!', sourceIp: '10.0.0.1', userAgent: 'Chrome' });
  assert.equal(loginResult.ok, true);
  emailLog.length = 0;

  // Request reset
  await auth.forgotPassword({ email });
  const resetEntry = emailLog.find((e) => e.type === 'reset');
  assert.ok(resetEntry?.token, 'reset email should be sent');

  // Reset password
  const resetResult = await auth.resetPassword({ token: resetEntry.token, password: 'NewPass789!' });
  assert.equal(resetResult.ok, true);

  // Both sessions should be revoked
  const loginSession = await auth.getSessionDb(loginResult.sessionId);
  const mfaSession = await auth.getSessionDb(mfaSessionId);
  assert.equal(loginSession, null);
  assert.equal(mfaSession, null);
});

test('change password requires authenticated session', async () => {
  const auth = createAuthService({ config: {}, pool, emailService: mockEmailService });
  const { sessionId } = await completeRegistration(auth, 'changepw');
  emailLog.length = 0;

  // mfa_setup session is not 'authenticated' — should fail
  const result = await auth.changePassword({ sessionId, currentPassword: 'SecurePass123!', newPassword: 'AnotherPass456!' });
  assert.equal(result.ok, false);
  assert.match(result.error, /auth_required/i);
});
