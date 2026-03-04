import crypto from 'node:crypto';

import { enrollMfa, generateCurrentOtp, verifyMfaCode } from './security.js';
import { loadAuthConfig } from './authConfig.js';

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function nowMs() {
  return Date.now();
}

function plusMs(ms) {
  return new Date(nowMs() + ms).toISOString();
}

export function createAuthService(config = loadAuthConfig()) {
  const oauthStates = new Map();
  const sessions = new Map();
  const usersByEmail = new Map();
  const usersById = new Map();
  const lockouts = new Map();
  const rateLimits = new Map();
  const auditEvents = [];

  const recoveryUsers = new Map([
    ['recovery@fmsys.local', { password: 'recovery-only', userId: 'user_recovery' }],
  ]);

  function recordAudit(eventType, actorId, metadata = {}) {
    const event = {
      id: randomId('audit'),
      eventType,
      actorId,
      metadata,
      createdAt: new Date().toISOString(),
    };
    auditEvents.push(event);
    return event;
  }

  function hitRateLimit({ dimension, key, max, windowMs }) {
    const bucketKey = `${dimension}:${key}`;
    const entry = rateLimits.get(bucketKey);
    const current = nowMs();

    if (!entry || entry.expiresAt <= current) {
      rateLimits.set(bucketKey, { count: 1, expiresAt: current + windowMs });
      return { limited: false, remaining: max - 1 };
    }

    entry.count += 1;
    if (entry.count > max) {
      return { limited: true, remaining: 0, retryAt: new Date(entry.expiresAt).toISOString() };
    }

    return { limited: false, remaining: max - entry.count };
  }

  function checkLockout(accountKey) {
    const lock = lockouts.get(accountKey);
    if (!lock) {
      return { locked: false };
    }
    if (!lock.lockedUntil || lock.lockedUntil <= 0) {
      return { locked: false };
    }
    if (lock.lockedUntil <= nowMs()) {
      lockouts.delete(accountKey);
      return { locked: false };
    }
    return { locked: true, lockedUntil: new Date(lock.lockedUntil).toISOString() };
  }

  function failAuthAttempt(accountKey) {
    const existing = lockouts.get(accountKey) ?? { fails: 0, lockedUntil: 0 };
    existing.fails += 1;

    if (existing.fails >= config.security.lockoutThreshold) {
      existing.lockedUntil = nowMs() + config.security.lockoutMs;
      existing.fails = 0;
    }

    lockouts.set(accountKey, existing);

    return {
      locked: existing.lockedUntil > nowMs(),
      lockedUntil: existing.lockedUntil > nowMs() ? new Date(existing.lockedUntil).toISOString() : null,
    };
  }

  function clearAuthFailures(accountKey) {
    lockouts.delete(accountKey);
  }

  function startOAuth({ provider, redirectUri }) {
    const supportedProviders = new Set(['google', 'apple']);
    if (!supportedProviders.has(provider)) {
      return { ok: false, code: 'unsupported_provider' };
    }

    const state = randomId('oauth_state');
    oauthStates.set(state, {
      provider,
      redirectUri,
      expiresAt: nowMs() + config.oauth.stateTtlMs,
    });

    const url = `${config.oauth.baseUrl}/${provider}/authorize?state=${state}`;
    return { ok: true, provider, state, authorizeUrl: url };
  }

  function handleOAuthCallback({ provider, code, state, sourceIp = 'unknown' }) {
    const stateEntry = oauthStates.get(state);
    if (!stateEntry || stateEntry.expiresAt <= nowMs() || stateEntry.provider !== provider) {
      recordAudit('auth.oauth_callback_failed', 'anonymous', { provider, reason: 'invalid_state', sourceIp });
      return { ok: false, status: 401, error: 'invalid_oauth_state' };
    }

    const ipLimit = hitRateLimit({
      dimension: 'oauth-ip',
      key: sourceIp,
      max: config.security.rateLimitMaxPerIp,
      windowMs: config.security.rateLimitWindowMs,
    });
    if (ipLimit.limited) {
      recordAudit('auth.throttled', 'anonymous', { route: 'oauth_callback', sourceIp });
      return { ok: false, status: 429, error: 'rate_limited' };
    }

    oauthStates.delete(state);
    const email = `${code || 'user'}@${provider}.oauth.local`;

    let user = usersByEmail.get(email);
    if (!user) {
      const enrollment = enrollMfa({ userId: randomId('user') });
      user = {
        userId: randomId('user'),
        email,
        provider,
        displayName: `${provider} user`,
        mfaSecret: enrollment.secret,
      };
      usersByEmail.set(email, user);
      usersById.set(user.userId, user);
    }
    if (!usersById.has(user.userId)) {
      usersById.set(user.userId, user);
    }

    const sessionId = randomId('sess');
    sessions.set(sessionId, {
      sessionId,
      userId: user.userId,
      state: 'pre_mfa',
      createdAt: new Date().toISOString(),
      expiresAt: plusMs(config.session.preMfaTtlMs),
      method: 'oauth',
      provider,
    });

    recordAudit('auth.oauth_success', user.userId, { provider, sourceIp });

    return {
      ok: true,
      status: 200,
      session: sessions.get(sessionId),
      mfa: { required: true, status: 'required' },
      user: { userId: user.userId, email: user.email, provider: user.provider },
    };
  }

  function loginRecovery({ email, password, sourceIp = 'unknown' }) {
    const accountKey = email.toLowerCase();

    const ipLimit = hitRateLimit({
      dimension: 'recovery-ip',
      key: sourceIp,
      max: config.security.rateLimitMaxPerIp,
      windowMs: config.security.rateLimitWindowMs,
    });
    if (ipLimit.limited) {
      recordAudit('auth.throttled', 'anonymous', { route: 'recovery_login', sourceIp });
      return { ok: false, status: 429, error: 'rate_limited' };
    }

    const accountLimit = hitRateLimit({
      dimension: 'recovery-account',
      key: accountKey,
      max: config.security.rateLimitMaxPerAccount,
      windowMs: config.security.rateLimitWindowMs,
    });
    if (accountLimit.limited) {
      recordAudit('auth.throttled', 'anonymous', { route: 'recovery_login', accountKey });
      return { ok: false, status: 429, error: 'rate_limited' };
    }

    const lockState = checkLockout(accountKey);
    if (lockState.locked) {
      recordAudit('auth.lockout_active', accountKey, { sourceIp });
      return { ok: false, status: 423, error: 'account_locked', lockedUntil: lockState.lockedUntil };
    }

    const found = recoveryUsers.get(accountKey);
    if (!found || found.password !== password) {
      const lockResult = failAuthAttempt(accountKey);
      recordAudit('auth.recovery_failed', accountKey, { sourceIp, lockResult });
      return {
        ok: false,
        status: lockResult.locked ? 423 : 401,
        error: lockResult.locked ? 'account_locked' : 'invalid_credentials',
        lockedUntil: lockResult.lockedUntil,
      };
    }

    if (!usersById.has(found.userId)) {
      const enrollment = enrollMfa({ userId: found.userId });
      usersById.set(found.userId, {
        userId: found.userId,
        email: accountKey,
        provider: 'local-recovery',
        displayName: 'Recovery User',
        mfaSecret: enrollment.secret,
      });
    }

    clearAuthFailures(accountKey);
    const sessionId = randomId('sess');
    sessions.set(sessionId, {
      sessionId,
      userId: found.userId,
      state: 'pre_mfa',
      createdAt: new Date().toISOString(),
      expiresAt: plusMs(config.session.preMfaTtlMs),
      method: 'recovery',
      provider: 'local-recovery',
    });

    recordAudit('auth.recovery_success', found.userId, { sourceIp });

    return {
      ok: true,
      status: 200,
      session: sessions.get(sessionId),
      mfa: { required: true, status: 'required' },
      user: { userId: found.userId, email: accountKey, provider: 'local-recovery' },
    };
  }

  function verifyMfa({ sessionId, code, sourceIp = 'unknown' }) {
    const session = sessions.get(sessionId);
    if (!session) {
      return { ok: false, status: 401, error: 'invalid_session' };
    }

    const accountKey = session.userId;
    const lockState = checkLockout(accountKey);
    if (lockState.locked) {
      recordAudit('auth.lockout_active', accountKey, { sourceIp, stage: 'mfa' });
      return { ok: false, status: 423, error: 'account_locked', lockedUntil: lockState.lockedUntil };
    }

    const user = usersById.get(session.userId);
    const secret = user?.mfaSecret;
    if (!secret) {
      return { ok: false, status: 400, error: 'mfa_not_configured' };
    }

    const verified = verifyMfaCode({ secret, code });
    if (!verified) {
      const lockResult = failAuthAttempt(accountKey);
      recordAudit('auth.mfa_failed', session.userId, { sourceIp, lockResult });
      return {
        ok: false,
        status: lockResult.locked ? 423 : 401,
        error: lockResult.locked ? 'account_locked' : 'invalid_mfa_code',
        mfa: {
          required: true,
          status: lockResult.locked ? 'locked' : 'required',
        },
      };
    }

    clearAuthFailures(accountKey);
    session.state = 'authenticated';
    session.elevatedAt = new Date().toISOString();
    session.expiresAt = plusMs(config.session.authTtlMs);
    recordAudit('auth.mfa_success', session.userId, { sourceIp, sessionId });

    return {
      ok: true,
      status: 200,
      session,
      mfa: { required: false, status: 'verified' },
    };
  }

  function getSession(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return null;
    }
    if (new Date(session.expiresAt).getTime() <= nowMs()) {
      sessions.delete(sessionId);
      return null;
    }
    return session;
  }

  function ensureAuthenticated(sessionId) {
    const session = getSession(sessionId);
    if (!session || session.state !== 'authenticated') {
      return { ok: false, status: 401, error: 'auth_required' };
    }
    return { ok: true, session };
  }

  function logout(sessionId, actorId = 'unknown') {
    sessions.delete(sessionId);
    recordAudit('auth.logout', actorId, { sessionId });
    return { ok: true };
  }

  function getAuditEvents() {
    return [...auditEvents];
  }

  function getMfaCodeForTesting({ email }) {
    const user = usersByEmail.get(email);
    if (!user) {
      return null;
    }
    return generateCurrentOtp(user.mfaSecret);
  }

  function getMfaCodeForSessionTesting(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      return null;
    }
    const user = usersById.get(session.userId);
    if (!user) {
      return null;
    }
    return generateCurrentOtp(user.mfaSecret);
  }

  return {
    config,
    startOAuth,
    handleOAuthCallback,
    loginRecovery,
    verifyMfa,
    getSession,
    ensureAuthenticated,
    logout,
    getAuditEvents,
    _internals: {
      usersByEmail,
      usersById,
      sessions,
      oauthStates,
      lockouts,
      rateLimits,
      getMfaCodeForTesting,
      getMfaCodeForSessionTesting,
    },
  };
}
