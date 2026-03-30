/**
 * Session repository — all auth_sessions queries.
 *
 * The auth_sessions table has NO `updated_at` column (see migrations 002/003).
 * Queries that modify rows do NOT touch updated_at.
 *
 * @param {import('pg').Pool} pool
 * @param {{ session: { ttlMs: number, idleMs: number } }} config
 */
export function createSessionRepository(pool, config) {
  const { ttlMs, idleMs } = config.session;

  return {
    /**
     * Insert a new session row and return it.
     * @param {{ userId: string, state: string, ip?: string, userAgent?: string, deviceLabel?: string }} params
     */
    async create({ userId, state, ip, userAgent, deviceLabel }) {
      const { rows } = await pool.query(
        `INSERT INTO auth_sessions
           (user_id, session_state, auth_method, ip_address, user_agent, device_label,
            expires_at, idle_timeout_at, last_active_at)
         VALUES
           ($1, $2, 'email', $3, $4, $5,
            NOW() + $6::interval,
            NOW() + $7::interval,
            NOW())
         RETURNING *`,
        [
          userId,
          state,
          ip ?? null,
          userAgent ?? null,
          deviceLabel ?? null,
          `${ttlMs} milliseconds`,
          `${idleMs} milliseconds`,
        ]
      );
      return rows[0];
    },

    /**
     * Return a session only if it is neither expired nor idle-timed-out.
     * @param {string} sessionId
     * @returns {Promise<object|null>}
     */
    async findValid(sessionId) {
      const { rows } = await pool.query(
        `SELECT * FROM auth_sessions
         WHERE session_id = $1
           AND expires_at > NOW()
           AND idle_timeout_at > NOW()`,
        [sessionId]
      );
      return rows[0] ?? null;
    },

    /**
     * Transition session_state to a new value.
     * @param {string} sessionId
     * @param {string} newState
     */
    async updateState(sessionId, newState) {
      await pool.query(
        'UPDATE auth_sessions SET session_state = $1 WHERE session_id = $2',
        [newState, sessionId]
      );
    },

    /**
     * Extend the idle timeout to keep the session alive.
     * @param {string} sessionId
     */
    async touch(sessionId) {
      await pool.query(
        `UPDATE auth_sessions
         SET last_active_at = NOW(),
             idle_timeout_at = NOW() + $1::interval
         WHERE session_id = $2`,
        [`${idleMs} milliseconds`, sessionId]
      );
    },

    /**
     * Hard-delete a single session.
     * @param {string} sessionId
     */
    async delete(sessionId) {
      await pool.query('DELETE FROM auth_sessions WHERE session_id = $1', [sessionId]);
    },

    /**
     * Return all non-expired, non-idle sessions for a user, newest first.
     * @param {string} userId
     * @returns {Promise<object[]>}
     */
    async findAllByUser(userId) {
      const { rows } = await pool.query(
        `SELECT * FROM auth_sessions
         WHERE user_id = $1
           AND expires_at > NOW()
           AND idle_timeout_at > NOW()
         ORDER BY created_at DESC`,
        [userId]
      );
      return rows;
    },

    /**
     * Delete every session for a user except one (e.g. after password change).
     * @param {string} userId
     * @param {string} keepSessionId
     */
    async revokeAllExcept(userId, keepSessionId) {
      await pool.query(
        'DELETE FROM auth_sessions WHERE user_id = $1 AND session_id != $2',
        [userId, keepSessionId]
      );
    },

    /**
     * Delete all sessions for a user (e.g. sign-out-everywhere).
     * @param {string} userId
     */
    async revokeAll(userId) {
      await pool.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
    },

    /**
     * Purge sessions that have passed either expiry or idle timeout.
     * Intended for a scheduled maintenance job.
     * @returns {Promise<number>} number of rows deleted
     */
    async deleteExpired() {
      const { rowCount } = await pool.query(
        `DELETE FROM auth_sessions
         WHERE expires_at < NOW() OR idle_timeout_at < NOW()`
      );
      return rowCount ?? 0;
    },
  };
}
