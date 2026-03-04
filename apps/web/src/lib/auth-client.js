function readCookie(name) {
  if (typeof document === 'undefined') {
    return null;
  }
  const parts = document.cookie.split(';').map((part) => part.trim());
  const prefix = `${name}=`;
  for (const part of parts) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name, value, maxAgeSeconds) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function clearCookie(name) {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:4020';
}

async function jsonFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
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

export async function startOAuthLogin(provider = 'google') {
  const base = getApiBaseUrl();
  const start = await jsonFetch(`${base}/api/v1/auth/oauth/start?provider=${provider}`);
  const callback = await jsonFetch(
    `${base}/api/v1/auth/oauth/callback?provider=${provider}&code=demo-code&state=${start.state}`,
  );

  writeCookie('fm_session_id', callback.session.sessionId, 60 * 60 * 24);
  writeCookie('fm_session_state', callback.session.state, 60 * 60 * 24);
  return callback;
}

export async function startRecoveryLogin({ email, password }) {
  const base = getApiBaseUrl();
  const result = await jsonFetch(`${base}/api/v1/auth/recovery/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  writeCookie('fm_session_id', result.session.sessionId, 60 * 60 * 24);
  writeCookie('fm_session_state', result.session.state, 60 * 60 * 24);
  return result;
}

export async function verifyMfa(code) {
  const sessionId = readCookie('fm_session_id');
  if (!sessionId) {
    throw new Error('missing_session');
  }

  const base = getApiBaseUrl();
  const result = await jsonFetch(`${base}/api/v1/auth/mfa/verify`, {
    method: 'POST',
    body: JSON.stringify({ sessionId, code }),
  });

  writeCookie('fm_session_state', result.session.state, 60 * 60 * 24);
  return result;
}

export async function fetchMfaCodeForDemo() {
  const sessionId = readCookie('fm_session_id');
  if (!sessionId) {
    throw new Error('missing_session');
  }
  const base = getApiBaseUrl();
  const result = await jsonFetch(`${base}/api/v1/auth/dev/mfa-code?sessionId=${sessionId}`);
  return result.code;
}

export function getSessionFromCookies() {
  return {
    sessionId: readCookie('fm_session_id'),
    state: readCookie('fm_session_state'),
  };
}

export function clearSessionCookies() {
  clearCookie('fm_session_id');
  clearCookie('fm_session_state');
}
