const DEFAULTS = {
  oauthBaseUrl: 'https://auth.example.local',
  sessionSecret: 'dev-session-secret',
  oauthStateTtlMs: 5 * 60 * 1000,
  preMfaSessionTtlMs: 10 * 60 * 1000,
  authSessionTtlMs: 24 * 60 * 60 * 1000,
  mfaIssuer: 'FMsys',
  mfaWindowSeconds: 30,
  rateLimitWindowMs: 60 * 1000,
  rateLimitMaxPerIp: 20,
  rateLimitMaxPerAccount: 10,
  lockoutThreshold: 5,
  lockoutMs: 15 * 60 * 1000,
  trustedDeviceHours: 12,
  featureAuthGateway: true,
};

function toNumber(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function loadAuthConfig(env = process.env) {
  return {
    database: {
      url: env.DATABASE_URL ?? 'postgresql://localhost:5432/fmsys',
    },
    oauth: {
      baseUrl: env.OAUTH_BASE_URL ?? DEFAULTS.oauthBaseUrl,
      googleClientId: env.OAUTH_GOOGLE_CLIENT_ID ?? 'google-dev-client',
      googleClientSecret: env.OAUTH_GOOGLE_CLIENT_SECRET ?? 'google-dev-secret',
      appleClientId: env.OAUTH_APPLE_CLIENT_ID ?? 'apple-dev-client',
      appleClientSecret: env.OAUTH_APPLE_CLIENT_SECRET ?? 'apple-dev-secret',
      stateTtlMs: toNumber(env.OAUTH_STATE_TTL_MS, DEFAULTS.oauthStateTtlMs),
    },
    session: {
      secret: env.SESSION_SIGNING_KEY ?? DEFAULTS.sessionSecret,
      preMfaTtlMs: toNumber(env.SESSION_PRE_MFA_TTL_MS, DEFAULTS.preMfaSessionTtlMs),
      authTtlMs: toNumber(env.SESSION_AUTH_TTL_MS, DEFAULTS.authSessionTtlMs),
      trustedDeviceHours: toNumber(env.MFA_TRUSTED_DEVICE_HOURS, DEFAULTS.trustedDeviceHours),
      idleMs: toNumber(env.AUTH_SESSION_IDLE_MS, 1800000),
    },
    mfa: {
      issuer: env.MFA_ISSUER ?? DEFAULTS.mfaIssuer,
      windowSeconds: toNumber(env.MFA_WINDOW_SECONDS, DEFAULTS.mfaWindowSeconds),
      encryptionKey: env.MFA_ENCRYPTION_KEY ?? '',
    },
    resend: {
      apiKey: env.RESEND_API_KEY ?? '',
      emailFrom: env.EMAIL_FROM ?? 'noreply@fmsys.app',
    },
    webauthn: {
      rpId: env.WEBAUTHN_RP_ID ?? 'localhost',
      rpName: env.WEBAUTHN_RP_NAME ?? 'FMsys',
      origin: env.WEBAUTHN_ORIGIN ?? 'http://localhost:4010',
      challengeTtlMs: toNumber(env.WEBAUTHN_CHALLENGE_TTL_MS, 60000),
    },
    security: {
      rateLimitWindowMs: toNumber(env.AUTH_RATE_LIMIT_WINDOW_MS, DEFAULTS.rateLimitWindowMs),
      rateLimitMaxPerIp: toNumber(env.AUTH_RATE_LIMIT_MAX_PER_IP, DEFAULTS.rateLimitMaxPerIp),
      rateLimitMaxPerAccount: toNumber(env.AUTH_RATE_LIMIT_MAX_PER_ACCOUNT, DEFAULTS.rateLimitMaxPerAccount),
      lockoutThreshold: toNumber(env.AUTH_LOCKOUT_THRESHOLD, DEFAULTS.lockoutThreshold),
      lockoutMs: toNumber(env.AUTH_LOCKOUT_MS, DEFAULTS.lockoutMs),
    },
    app: {
      url: env.APP_URL ?? 'http://localhost:4010',
      allowedOrigins: [
        'http://localhost:4010',
        'http://127.0.0.1:4010',
        env.WEBAUTHN_ORIGIN,
      ].filter(Boolean),
    },
    featureFlags: {
      authGateway: (env.FEATURE_AUTH_GATEWAY ?? String(DEFAULTS.featureAuthGateway)) === 'true',
    },
  };
}
