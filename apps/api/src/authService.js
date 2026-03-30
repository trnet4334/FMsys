import crypto from 'node:crypto';

import { enrollMfa, generateCurrentOtp, verifyMfaCode, verifyPassword, hashPassword, validatePasswordPolicy } from './security.js';
import { loadAuthConfig } from './authConfig.js';
import { createUserRepository } from './userRepository.js';
import { createSessionRepository } from './sessionRepository.js';
import { createTokenRepository } from './tokenRepository.js';

function randomId(prefix) {
  return `${prefix}_${crypto.randomBytes(8).toString('hex')}`;
}

function nowMs() {
  return Date.now();
}

function plusMs(ms) {
  return new Date(nowMs() + ms).toISOString();
}

export function createAuthService(options = {}) {
  // Support legacy call: createAuthService(config) where config has session/security/oauth keys
  // New call: createAuthService({ config, pool, emailService })
  let config, pool, emailService;
  if (options && (options.session || options.security || options.oauth)) {
    // Legacy: options IS the config
    config = options;
    pool = null;
    emailService = null;
  } else {
    config = options.config ?? null;
    pool = options.pool ?? null;
    emailService = options.emailService ?? null;
  }
  // Resolve config: if config is null or empty object, use loadAuthConfig() defaults
  const resolvedConfig = (config && Object.keys(config).length > 0) ? config : loadAuthConfig();

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

    if (existing.fails >= resolvedConfig.security.lockoutThreshold) {
      existing.lockedUntil = nowMs() + resolvedConfig.security.lockoutMs;
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
      expiresAt: nowMs() + resolvedConfig.oauth.stateTtlMs,
    });

    const url = `${resolvedConfig.oauth.baseUrl}/${provider}/authorize?state=${state}`;
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
      max: resolvedConfig.security.rateLimitMaxPerIp,
      windowMs: resolvedConfig.security.rateLimitWindowMs,
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
      expiresAt: plusMs(resolvedConfig.session.preMfaTtlMs),
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
      max: resolvedConfig.security.rateLimitMaxPerIp,
      windowMs: resolvedConfig.security.rateLimitWindowMs,
    });
    if (ipLimit.limited) {
      recordAudit('auth.throttled', 'anonymous', { route: 'recovery_login', sourceIp });
      return { ok: false, status: 429, error: 'rate_limited' };
    }

    const accountLimit = hitRateLimit({
      dimension: 'recovery-account',
      key: accountKey,
      max: resolvedConfig.security.rateLimitMaxPerAccount,
      windowMs: resolvedConfig.security.rateLimitWindowMs,
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
      expiresAt: plusMs(resolvedConfig.session.preMfaTtlMs),
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
    session.expiresAt = plusMs(resolvedConfig.session.authTtlMs);
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

  async function register({ email }) {
    if (!pool || !emailService) return { ok: false, error: 'service_not_configured' };
    const userRepo = createUserRepository(pool);
    const tokenRepo = createTokenRepository(pool);
    const existing = await userRepo.findByEmail(email);
    if (existing) return { ok: false, error: 'email_already_registered' };
    const user = await userRepo.create({ email });
    const tokenValue = await tokenRepo.create({ userId: user.user_id, type: 'email_verification', ttlMs: 15 * 60 * 1000 });
    await emailService.sendVerificationEmail(email, tokenValue);
    return { ok: true };
  }

  async function verifyEmail({ token }) {
    if (!pool) return { ok: false, error: 'service_not_configured' };
    const tokenRepo = createTokenRepository(pool);
    const userRepo = createUserRepository(pool);
    const tokenRow = await tokenRepo.findValid(token);
    if (!tokenRow) return { ok: false, error: 'invalid_or_expired_token' };
    await tokenRepo.consume(tokenRow.token_id);
    await userRepo.verifyEmail(tokenRow.user_id);
    const setupTokenValue = await tokenRepo.create({ userId: tokenRow.user_id, type: 'password_setup', ttlMs: 15 * 60 * 1000 });
    return { ok: true, setupToken: setupTokenValue };
  }

  async function setupPassword({ token, password }) {
    if (!pool) return { ok: false, error: 'service_not_configured' };
    const tokenRepo = createTokenRepository(pool);
    const userRepo = createUserRepository(pool);
    const sessionConfig = resolvedConfig.session ?? loadAuthConfig().session;
    const sessionRepo = createSessionRepository(pool, { session: sessionConfig });
    const tokenRow = await tokenRepo.findValid(token);
    if (!tokenRow || tokenRow.token_type !== 'password_setup') return { ok: false, error: 'invalid_or_expired_token' };
    const policy = validatePasswordPolicy(password);
    if (!policy.ok) return { ok: false, error: policy.error };
    await tokenRepo.consume(tokenRow.token_id);
    const hash = await hashPassword(password);
    await userRepo.setPassword(tokenRow.user_id, hash);
    await userRepo.activateAccount(tokenRow.user_id);
    const session = await sessionRepo.create({ userId: tokenRow.user_id, state: 'mfa_setup' });
    return { ok: true, sessionId: session.session_id };
  }

  async function login({ email, password, sourceIp = 'unknown', userAgent = '' }) {
    if (!pool) return { ok: false, error: 'service_not_configured' };
    const userRepo = createUserRepository(pool);
    const sessionConfig = resolvedConfig.session ?? loadAuthConfig().session;
    const sessionRepo = createSessionRepository(pool, { session: sessionConfig });

    const user = await userRepo.findByEmail(email);
    if (!user) return { ok: false, error: 'invalid_credentials' };

    if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
      return { ok: false, error: 'account_locked', lockedUntil: user.account_locked_until };
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      const lockoutThreshold = resolvedConfig.security?.lockoutThreshold ?? 5;
      const lockoutMs = resolvedConfig.security?.lockoutMs ?? 900000;
      await userRepo.incrementFailedAttempts(user.user_id);
      const updated = await userRepo.findById(user.user_id);
      if (updated.failed_login_attempts >= lockoutThreshold) {
        await userRepo.lockAccount(user.user_id, new Date(Date.now() + lockoutMs));
        await userRepo.resetFailedAttempts(user.user_id);
        return { ok: false, error: 'account_locked' };
      }
      return { ok: false, error: 'invalid_credentials' };
    }

    await userRepo.resetFailedAttempts(user.user_id);
    const session = await sessionRepo.create({ userId: user.user_id, state: 'pre_mfa', ip: sourceIp, userAgent });
    return { ok: true, sessionId: session.session_id, sessionState: 'pre_mfa' };
  }

  async function verifyMfaDb({ sessionId, code, sourceIp = 'unknown' }) {
    if (!pool) return { ok: false, error: 'service_not_configured' };
    const sessionConfig = resolvedConfig.session ?? loadAuthConfig().session;
    const sessionRepo = createSessionRepository(pool, { session: sessionConfig });
    const userRepo = createUserRepository(pool);

    const session = await sessionRepo.findValid(sessionId);
    if (!session || session.session_state !== 'pre_mfa') {
      return { ok: false, error: 'invalid_session' };
    }

    const user = await userRepo.findById(session.user_id);
    if (!user || !user.mfa_secret_enc) {
      return { ok: false, error: 'mfa_not_configured' };
    }

    const verified = verifyMfaCode({ secret: user.mfa_secret_enc, code });
    if (!verified) {
      return { ok: false, error: 'invalid_mfa_code' };
    }

    await sessionRepo.updateState(sessionId, 'authenticated');
    return { ok: true, sessionId, sessionState: 'authenticated' };
  }

  async function getSessionDb(sessionId) {
    if (!pool) return null;
    const sessionConfig = resolvedConfig.session ?? loadAuthConfig().session;
    const sessionRepo = createSessionRepository(pool, { session: sessionConfig });
    return await sessionRepo.findValid(sessionId);
  }

  async function logoutDb(sessionId) {
    if (!pool) return { ok: true };
    const sessionConfig = resolvedConfig.session ?? loadAuthConfig().session;
    const sessionRepo = createSessionRepository(pool, { session: sessionConfig });
    await sessionRepo.delete(sessionId);
    return { ok: true };
  }

  return {
    config: resolvedConfig,
    startOAuth,
    handleOAuthCallback,
    loginRecovery,
    verifyMfa,
    getSession,
    ensureAuthenticated,
    logout,
    getAuditEvents,
    register,
    verifyEmail,
    setupPassword,
    login,
    verifyMfaDb,
    getSessionDb,
    logoutDb,
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
