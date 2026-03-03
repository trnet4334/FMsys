import test from 'node:test';
import assert from 'node:assert/strict';

import {
  issueJwtToken,
  authorize,
  enrollMfa,
  verifyMfaCode,
  createAuditEvent,
  sealSecret,
  openSecret,
} from '../apps/api/src/security.js';

test('auth issues token and enforces RBAC permissions', () => {
  const token = issueJwtToken({ userId: 'u1', role: 'viewer' });
  assert.ok(token.length > 10);

  const writeAttempt = authorize({ role: 'viewer' }, 'write');
  const readAttempt = authorize({ role: 'viewer' }, 'read');

  assert.equal(writeAttempt.allowed, false);
  assert.equal(readAttempt.allowed, true);
});

test('mfa enroll and challenge verification', () => {
  const enrollment = enrollMfa({ userId: 'u1' });
  const ok = verifyMfaCode({
    secret: enrollment.secret,
    code: enrollment.currentCode,
  });

  assert.equal(ok, true);
});

test('audit logger captures actor action and target metadata', () => {
  const event = createAuditEvent({
    actorId: 'u1',
    action: 'snapshot.update',
    targetId: 's1',
  });

  assert.equal(event.actorId, 'u1');
  assert.equal(event.action, 'snapshot.update');
  assert.equal(event.targetId, 's1');
  assert.ok(event.timestamp);
});

test('secret sealing provides reversible encrypted payload', () => {
  const encrypted = sealSecret('sensitive', 'passphrase-32-bytes-minimum');
  const plain = openSecret(encrypted, 'passphrase-32-bytes-minimum');

  assert.equal(plain, 'sensitive');
});
