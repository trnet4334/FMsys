/**
 * User repository — all DB access for user_auth_profiles is here.
 * Uses parameterized SQL; never interpolates user data into query strings.
 *
 * @param {import('./db.js').Pool} pool
 */
export function createUserRepository(pool) {
  return {
    /**
     * Insert a new user with pending_verification status.
     * @param {{ email: string }} param0
     * @returns {Promise<object>} the inserted row
     */
    async create({ email }) {
      const { rows } = await pool.query(
        `INSERT INTO user_auth_profiles (user_id, primary_email, auth_provider, account_status)
         VALUES (gen_random_uuid(), $1, 'email', 'pending_verification')
         RETURNING *`,
        [email]
      );
      return rows[0];
    },

    /**
     * Find a user by primary email. Returns null when not found.
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async findByEmail(email) {
      const { rows } = await pool.query(
        'SELECT * FROM user_auth_profiles WHERE primary_email = $1',
        [email]
      );
      return rows[0] ?? null;
    },

    /**
     * Find a user by UUID. Returns null when not found.
     * @param {string} userId
     * @returns {Promise<object|null>}
     */
    async findById(userId) {
      const { rows } = await pool.query(
        'SELECT * FROM user_auth_profiles WHERE user_id = $1',
        [userId]
      );
      return rows[0] ?? null;
    },

    /**
     * Mark the user's email as verified.
     * @param {string} userId
     */
    async verifyEmail(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET email_verified = TRUE, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    /**
     * Store a password hash and transition the account to active.
     * @param {string} userId
     * @param {string} passwordHash
     */
    async setPassword(userId, passwordHash) {
      await pool.query(
        `UPDATE user_auth_profiles
         SET password_hash = $1, account_status = 'active', updated_at = NOW()
         WHERE user_id = $2`,
        [passwordHash, userId]
      );
    },

    /**
     * Transition the account status to active without changing the password.
     * @param {string} userId
     */
    async activateAccount(userId) {
      await pool.query(
        `UPDATE user_auth_profiles SET account_status = 'active', updated_at = NOW() WHERE user_id = $1`,
        [userId]
      );
    },

    /**
     * Store an encrypted MFA secret and enable MFA for the account.
     * @param {string} userId
     * @param {string} encryptedSecret
     */
    async setMfaSecret(userId, encryptedSecret) {
      await pool.query(
        'UPDATE user_auth_profiles SET mfa_secret = $1, mfa_enabled = TRUE, updated_at = NOW() WHERE user_id = $2',
        [encryptedSecret, userId]
      );
    },

    /**
     * Increment the failed login attempt counter by one.
     * @param {string} userId
     */
    async incrementFailedAttempts(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET failed_attempts = failed_attempts + 1, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    /**
     * Reset the failed attempt counter and clear any lockout timestamp.
     * @param {string} userId
     */
    async resetFailedAttempts(userId) {
      await pool.query(
        'UPDATE user_auth_profiles SET failed_attempts = 0, locked_until = NULL, updated_at = NOW() WHERE user_id = $1',
        [userId]
      );
    },

    /**
     * Set the lockout expiry timestamp for an account.
     * @param {string} userId
     * @param {Date} until
     */
    async lockAccount(userId, until) {
      await pool.query(
        'UPDATE user_auth_profiles SET locked_until = $1, updated_at = NOW() WHERE user_id = $2',
        [until, userId]
      );
    },

    /**
     * Update the password hash without changing account status.
     * @param {string} userId
     * @param {string} passwordHash
     */
    async updatePassword(userId, passwordHash) {
      await pool.query(
        'UPDATE user_auth_profiles SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [passwordHash, userId]
      );
    },
  };
}
