const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4020';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'content-type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function register(email) {
  return apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function setupPassword(token, password) {
  return apiFetch('/api/v1/auth/setup-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

export async function setupMfa() {
  return apiFetch('/api/v1/auth/mfa/setup', { method: 'POST' });
}

export async function verifyMfaSetup(code) {
  return apiFetch('/api/v1/auth/mfa/setup/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function login(email, password) {
  return apiFetch('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function verifyMfa(code) {
  return apiFetch('/api/v1/auth/mfa/verify', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export async function logout() {
  return apiFetch('/api/v1/auth/logout', { method: 'POST' });
}

export async function getSession() {
  return apiFetch('/api/v1/auth/session');
}

export async function forgotPassword(email) {
  return apiFetch('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token, newPassword) {
  return apiFetch('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password: newPassword }),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return apiFetch('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function listSessions() {
  return apiFetch('/api/v1/auth/sessions');
}

export async function revokeSession(sessionId) {
  return apiFetch(`/api/v1/auth/sessions/${sessionId}`, { method: 'DELETE' });
}

export async function revokeAllSessions() {
  return apiFetch('/api/v1/auth/sessions/revoke-all', { method: 'POST' });
}

// Passkey helpers
export async function passkeyRegisterOptions() {
  return apiFetch('/api/v1/auth/passkey/register/options', { method: 'POST' });
}

export async function passkeyRegisterVerify(credential) {
  return apiFetch('/api/v1/auth/passkey/register/verify', {
    method: 'POST',
    body: JSON.stringify(credential),
  });
}

export async function passkeyAssertOptions(userId) {
  return apiFetch('/api/v1/auth/passkey/assert/options', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function passkeyAssertVerify(userId, credential) {
  return apiFetch('/api/v1/auth/passkey/assert/verify', {
    method: 'POST',
    body: JSON.stringify({ userId, ...credential }),
  });
}

// Legacy aliases for existing login/mfa pages
export async function startRecoveryLogin({ email, password }) {
  const result = await login(email, password);
  if (!result.ok) {
    const error = new Error(result.data?.error ?? 'request_failed');
    error.payload = result.data;
    throw error;
  }
  return result.data;
}

export async function startOAuthLogin(provider = 'google') {
  const start = await apiFetch(`/api/v1/auth/oauth/start?provider=${provider}`);
  if (!start.ok) {
    const error = new Error(start.data?.error ?? 'oauth_start_failed');
    error.payload = start.data;
    throw error;
  }
  const callback = await apiFetch(
    `/api/v1/auth/oauth/callback?provider=${provider}&code=demo-code&state=${start.data.state}`,
  );
  if (!callback.ok) {
    const error = new Error(callback.data?.error ?? 'oauth_callback_failed');
    error.payload = callback.data;
    throw error;
  }
  return callback.data;
}

export async function fetchMfaCodeForDemo() {
  const session = await getSession();
  const sessionId = session.data?.session?.sessionId ?? session.data?.sessionId;
  if (!sessionId) {
    throw new Error('missing_session');
  }
  const result = await apiFetch(`/api/v1/auth/dev/mfa-code?sessionId=${sessionId}`);
  if (!result.ok) {
    const error = new Error(result.data?.error ?? 'request_failed');
    error.payload = result.data;
    throw error;
  }
  return result.data.code;
}
