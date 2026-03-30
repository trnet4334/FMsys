function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4020';
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(body.error ?? 'request_failed');
    error.payload = body;
    throw error;
  }
  return body;
}

// Legacy OAuth demo flow (in-memory, keeps working)
export async function startOAuthLogin(provider = 'google') {
  const base = getApiBaseUrl();
  const start = await jsonFetch(`${base}/api/v1/auth/oauth/start?provider=${provider}`);
  const callback = await jsonFetch(
    `${base}/api/v1/auth/oauth/callback?provider=${provider}&code=demo-code&state=${start.state}`,
  );
  return callback;
}

// Legacy recovery demo flow (in-memory, keeps working)
export async function startRecoveryLogin({ email, password }) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/recovery/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// MFA verify — session ID is carried by the fm_sid HttpOnly cookie automatically
export async function verifyMfa(code) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/mfa/verify`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

// Legacy MFA verify for in-memory sessions that still pass sessionId explicitly
export async function verifyMfaLegacy(sessionId, code) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/mfa/verify`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, code }),
  });
}

export async function fetchMfaCodeForDemo(sessionId = 'demo-user') {
  const base = getApiBaseUrl();
  const result = await jsonFetch(`${base}/api/v1/auth/dev/mfa-code?sessionId=${sessionId}`);
  return result.code;
}

// --- Production API functions ---

export async function register(email) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function setupPassword(token, password) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/setup-password`, {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function login(email, password) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/logout`, { method: 'POST' });
}

export async function getSession() {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/session`).catch(() => ({ session: null }));
}

export async function verifyMfaSetup(code) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/mfa/setup/verify`, {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function setupMfa() {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/mfa/setup`, { method: 'POST' });
}

export async function forgotPassword(email) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  });
}

export async function changePassword(currentPassword, newPassword) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function listSessions() {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/sessions`);
}

export async function revokeSession(sessionId) {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function revokeAllSessions() {
  const base = getApiBaseUrl();
  return jsonFetch(`${base}/api/v1/auth/sessions/revoke-all`, { method: 'POST' });
}
