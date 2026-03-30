export interface SessionInfo {
  session_id: string;
  session_state: string;
  created_at: string;
  last_active_at: string;
  expires_at: string;
  ip_address: string | null;
  device_label: string | null;
  user_agent: string | null;
}

export interface AuthResult {
  ok: boolean;
  sessionState?: string;
  sessionId?: string;
  session?: { sessionId: string; state: string };
  error?: string;
}

export interface MfaSetupResult {
  ok: boolean;
  otpauthUri?: string;
  qrDataUrl?: string;
  recoveryCodes?: string[];
}

export function startOAuthLogin(provider?: string): Promise<AuthResult>;
export function startRecoveryLogin(opts: { email: string; password: string }): Promise<AuthResult>;
export function verifyMfa(code: string): Promise<AuthResult>;
export function verifyMfaLegacy(sessionId: string, code: string): Promise<AuthResult>;
export function fetchMfaCodeForDemo(sessionId?: string): Promise<string>;
export function register(email: string): Promise<{ ok: boolean }>;
export function setupPassword(token: string, password: string): Promise<AuthResult>;
export function login(email: string, password: string): Promise<AuthResult>;
export function logout(): Promise<{ ok: boolean }>;
export function getSession(): Promise<{ session: SessionInfo | null }>;
export function verifyMfaSetup(code: string): Promise<AuthResult>;
export function setupMfa(): Promise<MfaSetupResult>;
export function forgotPassword(email: string): Promise<{ ok: boolean }>;
export function resetPassword(token: string, newPassword: string): Promise<AuthResult>;
export function changePassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean }>;
export function listSessions(): Promise<{ ok: boolean; sessions?: SessionInfo[] }>;
export function revokeSession(sessionId: string): Promise<{ ok: boolean }>;
export function revokeAllSessions(): Promise<{ ok: boolean }>;
