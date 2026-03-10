import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

test('login panel includes neutral theme marker', () => {
  const source = read('apps/web/src/components/auth/login-panel.tsx');
  assert.match(source, /data-theme="neutral"/i);
  assert.match(source, /Welcome Back/i);
  assert.match(source, /Enter your credentials to access your dashboard/i);
  assert.match(source, /Start your 14-day free trial/i);
  assert.match(source, /account_balance_wallet/i);
  assert.match(source, /name@company.com/i);
  assert.match(source, /••••••••/i);
  assert.match(source, /mail/i);
  assert.match(source, /lock/i);
});

test('mfa panel includes neutral theme marker', () => {
  const source = read('apps/web/src/components/auth/mfa-panel.tsx');
  assert.match(source, /data-theme="neutral"/i);
  assert.match(source, /Verification Required/i);
  assert.match(source, /Please enter the 6-digit code from your authenticator app/i);
  assert.match(source, /Didn't receive a code\?/i);
});
