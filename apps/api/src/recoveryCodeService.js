import { randomBytes } from 'node:crypto';

/**
 * Generate 8 random MFA recovery codes in XXXX-XXXX format.
 * @returns {string[]} array of 8 codes
 */
export function generate() {
  return Array.from({ length: 8 }, () => {
    const part1 = randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
    const part2 = randomBytes(3).toString('hex').toUpperCase().slice(0, 4);
    return `${part1}-${part2}`;
  });
}

/**
 * Hash each code with Argon2id and insert into recovery_codes table.
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @param {string[]} codes - plaintext codes from generate()
 */
export async function storeHashes(pool, userId, codes) {
  for (const code of codes) {
    const codeHash = await hashCode(code);
    await pool.query(
      'INSERT INTO recovery_codes (user_id, code_hash) VALUES ($1, $2)',
      [userId, codeHash]
    );
  }
}

/**
 * Verify a recovery code for a user. Consumes the code if valid (single-use).
 * @param {import('pg').Pool} pool
 * @param {string} userId
 * @param {string} candidateCode
 * @returns {Promise<boolean>}
 */
export async function verify(pool, userId, candidateCode) {
  const { rows } = await pool.query(
    'SELECT id, code_hash FROM recovery_codes WHERE user_id = $1 AND consumed_at IS NULL',
    [userId]
  );
  for (const row of rows) {
    const match = await verifyCode(candidateCode, row.code_hash);
    if (match) {
      await pool.query(
        'UPDATE recovery_codes SET consumed_at = NOW() WHERE id = $1',
        [row.id]
      );
      return true;
    }
  }
  return false;
}

/**
 * Delete all recovery codes for a user (used before regenerating).
 * @param {import('pg').Pool} pool
 * @param {string} userId
 */
export async function deleteAll(pool, userId) {
  await pool.query('DELETE FROM recovery_codes WHERE user_id = $1', [userId]);
}

// Internal helpers

/**
 * Hash a recovery code using Argon2id (Node 21.7+ built-in crypto).
 * The returned string is in PHC format and embeds salt + parameters.
 * @param {string} code
 * @returns {Promise<string>}
 */
async function hashCode(code) {
  const { hash } = await import('node:crypto');
  return await hash('argon2id', code, {
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });
}

/**
 * Verify a recovery code against a stored Argon2id hash.
 * @param {string} candidate
 * @param {string} storedHash - PHC format hash from hashCode()
 * @returns {Promise<boolean>}
 */
async function verifyCode(candidate, storedHash) {
  try {
    const { verify } = await import('node:crypto');
    return await verify('argon2id', candidate, storedHash);
  } catch {
    return false;
  }
}
