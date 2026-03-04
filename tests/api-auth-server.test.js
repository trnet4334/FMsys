import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

import { createAuthRoutes, withAuthRequired } from '../apps/api/src/authRoutes.js';

function createMockRequest({ method = 'GET', path = '/', body = null, headers = {} }) {
  const req = new EventEmitter();
  req.method = method;
  req.url = path;
  req.headers = headers;
  req.socket = { remoteAddress: '127.0.0.1' };

  process.nextTick(() => {
    if (body !== null) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });

  return req;
}

function createMockResponse() {
  let resolve;
  const done = new Promise((res) => {
    resolve = res;
  });

  const response = {
    statusCode: 0,
    headers: {},
    payload: '',
    writeHead(statusCode, headers) {
      response.statusCode = statusCode;
      response.headers = headers;
    },
    end(chunk = '') {
      response.payload += chunk;
      resolve();
    },
  };

  return { response, done };
}

async function runRoute(handler, req, url) {
  const { response, done } = createMockResponse();
  await handler(req, response, url);
  await done;

  return {
    status: response.statusCode,
    body: response.payload ? JSON.parse(response.payload) : {},
  };
}

test('auth routes: oauth + mfa transitions to authenticated session', async () => {
  const routes = createAuthRoutes();

  const start = await runRoute(
    routes.handle,
    createMockRequest({ method: 'GET', path: '/api/v1/auth/oauth/start?provider=google' }),
    new URL('http://127.0.0.1/api/v1/auth/oauth/start?provider=google'),
  );
  assert.equal(start.status, 200);

  const callbackPath = `/api/v1/auth/oauth/callback?provider=google&code=demo&state=${start.body.state}`;
  const callback = await runRoute(
    routes.handle,
    createMockRequest({ method: 'GET', path: callbackPath }),
    new URL(`http://127.0.0.1${callbackPath}`),
  );
  assert.equal(callback.status, 200);
  assert.equal(callback.body.session.state, 'pre_mfa');

  const codePath = `/api/v1/auth/dev/mfa-code?sessionId=${callback.body.session.sessionId}`;
  const mfaCode = await runRoute(
    routes.handle,
    createMockRequest({ method: 'GET', path: codePath }),
    new URL(`http://127.0.0.1${codePath}`),
  );

  const verify = await runRoute(
    routes.handle,
    createMockRequest({
      method: 'POST',
      path: '/api/v1/auth/mfa/verify',
      body: { sessionId: callback.body.session.sessionId, code: mfaCode.body.code },
      headers: { 'content-type': 'application/json' },
    }),
    new URL('http://127.0.0.1/api/v1/auth/mfa/verify'),
  );

  assert.equal(verify.status, 200);
  assert.equal(verify.body.session.state, 'authenticated');
});

test('auth required wrapper denies unauthenticated and allows authenticated request', async () => {
  const routes = createAuthRoutes();

  const protectedHandler = withAuthRequired(routes.service, async (req, res) => {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
  });

  const denied = await runRoute(
    protectedHandler,
    createMockRequest({ method: 'GET', path: '/api/net-worth/summary' }),
    new URL('http://127.0.0.1/api/net-worth/summary'),
  );
  assert.equal(denied.status, 401);

  const start = routes.service.startOAuth({ provider: 'google', redirectUri: 'http://localhost/login' });
  const callback = routes.service.handleOAuthCallback({ provider: 'google', code: 'demo', state: start.state });
  const code = routes.service._internals.getMfaCodeForSessionTesting(callback.session.sessionId);
  routes.service.verifyMfa({ sessionId: callback.session.sessionId, code });

  const allowed = await runRoute(
    protectedHandler,
    createMockRequest({
      method: 'GET',
      path: '/api/net-worth/summary',
      headers: { authorization: `Bearer ${callback.session.sessionId}` },
    }),
    new URL('http://127.0.0.1/api/net-worth/summary'),
  );
  assert.equal(allowed.status, 200);
  assert.equal(allowed.body.ok, true);
});

test('passkey placeholder endpoints are reserved and backward-compatible', async () => {
  const routes = createAuthRoutes();

  const register = await runRoute(
    routes.handle,
    createMockRequest({ method: 'POST', path: '/api/v1/passkeys/register/options' }),
    new URL('http://127.0.0.1/api/v1/passkeys/register/options'),
  );

  const assertion = await runRoute(
    routes.handle,
    createMockRequest({ method: 'POST', path: '/api/v1/passkeys/assert/options' }),
    new URL('http://127.0.0.1/api/v1/passkeys/assert/options'),
  );

  assert.equal(register.status, 501);
  assert.equal(assertion.status, 501);
});
