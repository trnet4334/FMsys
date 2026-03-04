export const SESSION_STATES = {
  PRE_MFA: 'pre_mfa',
  AUTHENTICATED: 'authenticated',
};

export const MFA_CHALLENGE_STATUS = {
  REQUIRED: 'required',
  VERIFIED: 'verified',
  LOCKED: 'locked',
};

export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  APPLE: 'apple',
};

export function createOAuthProfile({ provider, providerUserId, email, displayName }) {
  return {
    provider,
    providerUserId,
    email,
    displayName,
  };
}

export function createSessionPayload({ sessionId, userId, state, expiresAt }) {
  return {
    sessionId,
    userId,
    state,
    expiresAt,
  };
}

export function createMfaStatus({ status, remainingAttempts, lockedUntil = null }) {
  return {
    status,
    remainingAttempts,
    lockedUntil,
  };
}
