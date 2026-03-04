import { createAuthService } from './authService.js';

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

function getSessionIdFromRequest(req, url) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return url.searchParams.get('sessionId');
}

export function createAuthRoutes(service = createAuthService()) {
  async function handle(req, res, url) {
    if (req.method === 'GET' && url.pathname === '/api/v1/auth/oauth/start') {
      const provider = url.searchParams.get('provider') ?? 'google';
      const redirectUri = url.searchParams.get('redirectUri') ?? 'http://127.0.0.1:4010/login';
      const result = service.startOAuth({ provider, redirectUri });
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/oauth/callback') {
      const provider = url.searchParams.get('provider') ?? 'google';
      const code = url.searchParams.get('code') ?? '';
      const state = url.searchParams.get('state') ?? '';
      const result = service.handleOAuthCallback({ provider, code, state, sourceIp: getClientIp(req) });
      return sendJson(res, result.status ?? 200, result);
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/recovery/login') {
      const payload = await readJson(req);
      const result = service.loginRecovery({
        email: payload.email ?? '',
        password: payload.password ?? '',
        sourceIp: getClientIp(req),
      });
      return sendJson(res, result.status ?? 200, result);
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/mfa/verify') {
      const payload = await readJson(req);
      const result = service.verifyMfa({
        sessionId: payload.sessionId ?? '',
        code: payload.code ?? '',
        sourceIp: getClientIp(req),
      });
      return sendJson(res, result.status ?? 200, result);
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/session') {
      const sessionId = getSessionIdFromRequest(req, url);
      const session = sessionId ? service.getSession(sessionId) : null;
      return sendJson(res, session ? 200 : 401, { session });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/logout') {
      const payload = await readJson(req);
      const sessionId = payload.sessionId ?? getSessionIdFromRequest(req, url);
      if (sessionId) {
        const current = service.getSession(sessionId);
        service.logout(sessionId, current?.userId ?? 'anonymous');
      }
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/audit') {
      return sendJson(res, 200, { items: service.getAuditEvents() });
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/dev/mfa-code') {
      const sessionId = url.searchParams.get('sessionId') ?? '';
      const code = service._internals.getMfaCodeForSessionTesting(sessionId);
      return sendJson(res, code ? 200 : 404, { code });
    }

    // Passkey readiness placeholders (versioned and backward-compatible)
    if (req.method === 'POST' && url.pathname === '/api/v1/passkeys/register/options') {
      return sendJson(res, 501, { error: 'not_implemented', message: 'Passkey registration reserved for future release.' });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/passkeys/assert/options') {
      return sendJson(res, 501, { error: 'not_implemented', message: 'Passkey assertion reserved for future release.' });
    }

    return false;
  }

  return { handle, service };
}

export function withAuthRequired(service, handler) {
  return async function authWrapped(req, res, url) {
    const sessionId = getSessionIdFromRequest(req, url);
    const auth = service.ensureAuthenticated(sessionId ?? '');
    if (!auth.ok) {
      res.writeHead(auth.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: auth.error }));
      return;
    }
    return handler(req, res, url, auth.session);
  };
}
