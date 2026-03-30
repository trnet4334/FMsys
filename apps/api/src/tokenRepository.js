import { randomBytes } from 'node:crypto';

/**
 * Factory for auth token CRUD operations.
 * Tokens are single-use: once consumed_at is set they are invalid.
 * @param {import('pg').Pool} pool
 */
export function createTokenRepository(pool) {
  return {
    /**
     * Create a new auth token and return its token_value.
     * @param {{ userId: string, type: string, ttlMs: number }} opts
     * @returns {Promise<string>} token_value (base64url)
     */
    async create({ userId, type, ttlMs }) {
      const tokenValue = randomBytes(32).toString('base64url');
      await pool.query(
        `INSERT INTO auth_tokens (token_value, user_id, token_type, expires_at)
         VALUES ($1, $2, $3, NOW() + $4::interval)`,
        [tokenValue, userId, type, `${ttlMs} milliseconds`]
      );
      return tokenValue;
    },

    /**
     * Find a valid (not expired, not consumed) token by its value.
     * @param {string} tokenValue
     * @returns {Promise<object|null>} full token row or null
     */
    async findValid(tokenValue) {
      const { rows } = await pool.query(
        `SELECT * FROM auth_tokens
         WHERE token_value = $1
           AND consumed_at IS NULL
           AND expires_at > NOW()`,
        [tokenValue]
      );
      return rows[0] ?? null;
    },

    /**
     * Mark a token as consumed (prevents reuse).
     * @param {string} tokenId UUID
     */
    async consume(tokenId) {
      await pool.query(
        'UPDATE auth_tokens SET consumed_at = NOW() WHERE token_id = $1',
        [tokenId]
      );
    },

    /**
     * Delete all expired tokens (housekeeping).
     * @returns {Promise<number>} rows deleted
     */
    async deleteExpired() {
      const { rowCount } = await pool.query(
        'DELETE FROM auth_tokens WHERE expires_at < NOW()'
      );
      return rowCount ?? 0;
    },
  };
}
