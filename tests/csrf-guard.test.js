import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrigin } from '../apps/api/src/csrfGuard.js';
import { validatePasswordPolicy } from '../apps/api/src/security.js';

const allowed = ['http://localhost:4010', 'http://127.0.0.1:4010'];

test('GET requests always pass', () => {
  assert.equal(validateOrigin('GET', null, allowed), true);
});

test('HEAD requests always pass', () => {
  assert.equal(validateOrigin('HEAD', null, allowed), true);
});

test('OPTIONS requests always pass', () => {
  assert.equal(validateOrigin('OPTIONS', null, allowed), true);
});

test('POST with valid origin passes', () => {
  assert.equal(validateOrigin('POST', 'http://localhost:4010', allowed), true);
});

test('POST with invalid origin fails', () => {
  assert.equal(validateOrigin('POST', 'http://evil.com', allowed), false);
});

test('POST with missing origin fails', () => {
  assert.equal(validateOrigin('POST', null, allowed), false);
});

test('DELETE with valid origin passes', () => {
  assert.equal(validateOrigin('DELETE', 'http://127.0.0.1:4010', allowed), true);
});

test('PATCH with invalid origin fails', () => {
  assert.equal(validateOrigin('PATCH', 'http://attacker.example.com', allowed), false);
});

test('validatePasswordPolicy rejects short passwords', () => {
  const result = validatePasswordPolicy('Short1');
  assert.equal(result.ok, false);
});

test('validatePasswordPolicy rejects missing uppercase', () => {
  const result = validatePasswordPolicy('password123!');
  assert.equal(result.ok, false);
});

test('validatePasswordPolicy accepts valid password', () => {
  const result = validatePasswordPolicy('SecurePass123');
  assert.equal(result.ok, true);
});
