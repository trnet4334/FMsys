import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const middlewarePath = 'apps/web/middleware.ts';
const loginPath = 'apps/web/app/login/page.tsx';
const mfaPath = 'apps/web/app/mfa/page.tsx';

test('web auth gateway files enforce login and mfa path controls', () => {
  const middleware = fs.readFileSync(middlewarePath, 'utf8');
  const loginPage = fs.readFileSync(loginPath, 'utf8');
  const mfaPage = fs.readFileSync(mfaPath, 'utf8');

  assert.match(middleware, /\/login/);
  assert.match(middleware, /\/mfa/);
  assert.match(middleware, /session_state/);

  assert.match(loginPage, /LoginPanel/);
  assert.match(mfaPage, /MfaPanel/);
});
