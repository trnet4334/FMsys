import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const read = (file) =>
  fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

test('login prototype keeps core elements', () => {
  const html = read('prototype/login.html');
  assert.match(html, /Neutral UI/i);
  assert.match(html, /data-theme="neutral"/i);
  assert.match(html, /<form[^>]*>/i);
  assert.match(html, /name="email"/i);
  assert.match(html, /name="password"/i);
  assert.match(html, /Remember me/i);
  assert.match(html, /Sign In/i);
});

test('mfa prototype keeps core elements', () => {
  const html = read('prototype/mfa.html');
  assert.match(html, /Enter MFA Code/i);
  assert.match(html, /one-time-code/i);
  assert.match(html, /Verify/i);
  assert.match(html, /Resend code/i);
});
