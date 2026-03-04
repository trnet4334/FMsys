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
    },
    mfa: {
      issuer: env.MFA_ISSUER ?? DEFAULTS.mfaIssuer,
      windowSeconds: toNumber(env.MFA_WINDOW_SECONDS, DEFAULTS.mfaWindowSeconds),
    },
    security: {
      rateLimitWindowMs: toNumber(env.AUTH_RATE_LIMIT_WINDOW_MS, DEFAULTS.rateLimitWindowMs),
      rateLimitMaxPerIp: toNumber(env.AUTH_RATE_LIMIT_MAX_PER_IP, DEFAULTS.rateLimitMaxPerIp),
      rateLimitMaxPerAccount: toNumber(env.AUTH_RATE_LIMIT_MAX_PER_ACCOUNT, DEFAULTS.rateLimitMaxPerAccount),
      lockoutThreshold: toNumber(env.AUTH_LOCKOUT_THRESHOLD, DEFAULTS.lockoutThreshold),
      lockoutMs: toNumber(env.AUTH_LOCKOUT_MS, DEFAULTS.lockoutMs),
    },
    featureFlags: {
      authGateway: (env.FEATURE_AUTH_GATEWAY ?? String(DEFAULTS.featureAuthGateway)) === 'true',
    },
  };
}
