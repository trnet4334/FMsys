import { createAuthService } from './authService.js';
import { validateOrigin } from './csrfGuard.js';

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

function getSessionIdFromCookie(req) {
  const cookieHeader = req.headers.cookie ?? '';
  const match = cookieHeader.match(/(?:^|;\s*)fm_sid=([^;]+)/);
  return match?.[1] ?? null;
}

function getSessionIdFromRequest(req, url) {
  // Prefer fm_sid cookie
  const fromCookie = getSessionIdFromCookie(req);
  if (fromCookie) return fromCookie;
  // Legacy fallback
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return url.searchParams.get('sessionId');
}

function setSessionCookie(res, sessionId) {
  res.setHeader('Set-Cookie', `fm_sid=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'fm_sid=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
}

export function createAuthRoutes(service = createAuthService(), passkeyService = null) {
  async function handle(req, res, url) {
    const allowedOrigins = ['http://localhost:4010', 'http://127.0.0.1:4010'];
    if (!validateOrigin(req.method, req.headers.origin ?? null, allowedOrigins)) {
      return sendJson(res, 403, { error: 'forbidden' });
    }

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
      const sessionId = getSessionIdFromRequest(req, url) ?? payload.sessionId ?? '';
      // Try DB-backed first, fall back to in-memory
      const result = service.verifyMfaDb
        ? await service.verifyMfaDb({ sessionId, code: payload.code ?? '', sourceIp: getClientIp(req) })
        : service.verifyMfa({ sessionId, code: payload.code ?? '', sourceIp: getClientIp(req) });
      return sendJson(res, result.status ?? (result.ok ? 200 : 401), result);
    }

    if (req.method === 'GET' && url.pathname === '/api/v1/auth/session') {
      const sessionId = getSessionIdFromRequest(req, url);
      let session = null;
      if (sessionId) {
        session = service.getSessionDb
          ? await service.getSessionDb(sessionId)
          : service.getSession(sessionId);
      }
      // Normalize the response shape for the middleware
      const state = session?.session_state ?? session?.state ?? null;
      return sendJson(res, session ? 200 : 401, {
        ok: !!session,
        session: session ? { session_id: session.session_id ?? session.sessionId, session_state: state } : null,
      });
    }

    if (req.method === 'POST' && url.pathname === '/api/v1/auth/logout') {
      const payload = await readJson(req);
      const sessionId = getSessionIdFromRequest(req, url) ?? payload.sessionId ?? '';
      if (sessionId) {
        if (service.logoutDb) {
          await service.logoutDb(sessionId);
        } else {
          const current = service.getSession(sessionId);
          service.logout(sessionId, current?.userId ?? 'anonymous');
        }
      }
      clearSessionCookie(res);
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

    // POST /api/v1/auth/register
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/register') {
      const { email } = await readJson(req);
      const result = await service.register({ email: email ?? '' });
      return sendJson(res, result.ok ? 200 : 409, result);
    }

    // GET /api/v1/auth/verify-email
    if (req.method === 'GET' && url.pathname === '/api/v1/auth/verify-email') {
      const token = url.searchParams.get('token') ?? '';
      const result = await service.verifyEmail({ token });
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    // POST /api/v1/auth/setup-password
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/setup-password') {
      const { token, password } = await readJson(req);
      const result = await service.setupPassword({ token: token ?? '', password: password ?? '' });
      if (result.ok) setSessionCookie(res, result.sessionId);
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    // POST /api/v1/auth/mfa/setup
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/mfa/setup') {
      const sessionId = getSessionIdFromRequest(req, url);
      const result = await service.setupMfa({ sessionId: sessionId ?? '' });
      return sendJson(res, result.ok ? 200 : 401, result);
    }

    // POST /api/v1/auth/mfa/setup/verify
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/mfa/setup/verify') {
      const sessionId = getSessionIdFromRequest(req, url);
      const { code } = await readJson(req);
      const result = await service.verifyMfaSetup({ sessionId: sessionId ?? '', code: code ?? '' });
      return sendJson(res, result.ok ? 200 : 401, result);
    }

    // POST /api/v1/auth/login
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/login') {
      const { email, password } = await readJson(req);
      const result = await service.login({
        email: email ?? '',
        password: password ?? '',
        sourceIp: getClientIp(req),
        userAgent: req.headers['user-agent'] ?? '',
      });
      if (result.ok) setSessionCookie(res, result.sessionId);
      return sendJson(res, result.ok ? 200 : 401, result);
    }

    // POST /api/v1/auth/forgot-password
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/forgot-password') {
      const { email } = await readJson(req);
      await service.forgotPassword({ email: email ?? '' });
      return sendJson(res, 200, { ok: true }); // always 200
    }

    // POST /api/v1/auth/reset-password
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/reset-password') {
      const { token, password } = await readJson(req);
      const result = await service.resetPassword({ token: token ?? '', password: password ?? '' });
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    // POST /api/v1/auth/change-password
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/change-password') {
      const sessionId = getSessionIdFromRequest(req, url);
      const { currentPassword, newPassword } = await readJson(req);
      const result = await service.changePassword({ sessionId: sessionId ?? '', currentPassword: currentPassword ?? '', newPassword: newPassword ?? '' });
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    // GET /api/v1/auth/sessions (plural — list all user sessions)
    if (req.method === 'GET' && url.pathname === '/api/v1/auth/sessions') {
      // TODO: implement in Task 19 (settings page)
      return sendJson(res, 501, { error: 'not_implemented' });
    }

    // DELETE /api/v1/auth/sessions/:id
    if (req.method === 'DELETE' && url.pathname.startsWith('/api/v1/auth/sessions/')) {
      return sendJson(res, 501, { error: 'not_implemented' });
    }

    // POST /api/v1/auth/sessions/revoke-all
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/sessions/revoke-all') {
      return sendJson(res, 501, { error: 'not_implemented' });
    }

    // POST /api/v1/auth/passkey/register/options
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/passkey/register/options') {
      const sessionId = getSessionIdFromRequest(req, url);
      const session = sessionId ? await service.getSessionDb?.(sessionId) : null;
      if (!session) return sendJson(res, 401, { error: 'auth_required' });
      if (!passkeyService) return sendJson(res, 501, { error: 'passkeys_not_configured' });
      const opts = await passkeyService.generateRegistrationOptions(session.user_id, session.user_id);
      return sendJson(res, 200, opts);
    }

    // POST /api/v1/auth/passkey/register/verify
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/passkey/register/verify') {
      const sessionId = getSessionIdFromRequest(req, url);
      const session = sessionId ? await service.getSessionDb?.(sessionId) : null;
      if (!session) return sendJson(res, 401, { error: 'auth_required' });
      if (!passkeyService) return sendJson(res, 501, { error: 'passkeys_not_configured' });
      const body = await readJson(req);
      const result = await passkeyService.verifyRegistration(session.user_id, body);
      return sendJson(res, result.ok ? 200 : 400, result);
    }

    // POST /api/v1/auth/passkey/assert/options
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/passkey/assert/options') {
      const { userId } = await readJson(req);
      if (!passkeyService) return sendJson(res, 501, { error: 'passkeys_not_configured' });
      const opts = await passkeyService.generateAssertionOptions(userId ?? '');
      return sendJson(res, 200, opts);
    }

    // POST /api/v1/auth/passkey/assert/verify
    if (req.method === 'POST' && url.pathname === '/api/v1/auth/passkey/assert/verify') {
      if (!passkeyService) return sendJson(res, 501, { error: 'passkeys_not_configured' });
      const body = await readJson(req);
      const result = await passkeyService.verifyAssertion(body.userId ?? '', body);
      // TODO: wire proper session creation for passkey auth in a future task
      return sendJson(res, result.ok ? 200 : 401, result);
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
