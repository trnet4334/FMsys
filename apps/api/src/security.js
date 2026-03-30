import crypto from 'node:crypto';

const ROLE_PERMISSIONS = {
  viewer: ['read'],
  editor: ['read', 'write'],
  owner: ['read', 'write', 'export', 'admin'],
};

function stableBase64Url(input) {
  return Buffer.from(input).toString('base64url');
}

export function issueJwtToken({ userId, role }) {
  const header = stableBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = stableBase64Url(JSON.stringify({ sub: userId, role, iat: Math.floor(Date.now() / 1000) }));
  const signature = stableBase64Url(crypto.createHash('sha256').update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}

export function authorize(identity, permission) {
  const permissions = ROLE_PERMISSIONS[identity.role] ?? [];
  return { allowed: permissions.includes(permission) };
}

function generateOtp(secret, counter) {
  const digest = crypto.createHmac('sha1', secret).update(String(counter)).digest('hex');
  const numeric = Number.parseInt(digest.slice(-6), 16).toString().slice(0, 6).padStart(6, '0');
  return numeric;
}

export function generateCurrentOtp(secret) {
  const counter = Math.floor(Date.now() / 30000);
  return generateOtp(secret, counter);
}

export function enrollMfa({ userId }) {
  const secret = crypto.createHash('sha256').update(`${userId}:${Date.now()}`).digest('hex').slice(0, 32);
  const currentCode = generateCurrentOtp(secret);
  return { secret, currentCode };
}

export function verifyMfaCode({ secret, code }) {
  const counter = Math.floor(Date.now() / 30000);
  return generateOtp(secret, counter) === code;
}

export function createAuditEvent({ actorId, action, targetId }) {
  return {
    actorId,
    action,
    targetId,
    timestamp: new Date().toISOString(),
  };
}

function deriveKey(passphrase) {
  return crypto.createHash('sha256').update(passphrase).digest();
}

export function sealSecret(value, passphrase) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', deriveKey(passphrase), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);

  return {
    iv: iv.toString('hex'),
    payload: encrypted.toString('hex'),
  };
}

export function openSecret(envelope, passphrase) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    deriveKey(passphrase),
    Buffer.from(envelope.iv, 'hex'),
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(envelope.payload, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

/**
 * Hash a password using Argon2id (Node 21.7+ built-in crypto).
 * The returned string embeds salt + parameters for later verification.
 * @param {string} password
 * @returns {Promise<string>} PHC-format hash string
 */
export async function hashPassword(password) {
  const { hash } = await import('node:crypto');
  return await hash('argon2id', password, {
    memoryCost: 65536,   // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify a password against a stored Argon2id hash.
 * Uses crypto.verify which extracts salt from storedHash for constant-time comparison.
 * @param {string} password
 * @param {string} storedHash - PHC-format hash from hashPassword()
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, storedHash) {
  const { verify } = await import('node:crypto');
  return await verify('argon2id', password, storedHash);
}

/**
 * Validate password meets policy requirements.
 * @param {string} password
 * @returns {{ ok: boolean, error?: string }}
 */
export function validatePasswordPolicy(password) {
  if (password.length < 12) return { ok: false, error: 'Password must be at least 12 characters' };
  if (!/[a-z]/.test(password)) return { ok: false, error: 'Password must contain a lowercase letter' };
  if (!/[A-Z]/.test(password)) return { ok: false, error: 'Password must contain an uppercase letter' };
  if (!/[0-9]/.test(password)) return { ok: false, error: 'Password must contain a digit' };
  return { ok: true };
}
