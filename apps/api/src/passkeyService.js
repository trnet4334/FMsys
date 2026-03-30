import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

/**
 * Factory for WebAuthn Passkey operations.
 * Challenges are stored in-memory (Map) with TTL — suitable for single-instance deployments.
 * Credentials are stored in PostgreSQL webauthn_credentials table.
 */
export function createPasskeyService({ pool, config }) {
  const { rpId, rpName, origin, challengeTtlMs = 60000 } = config.webauthn;

  // In-memory challenge store with TTL
  const challenges = new Map(); // userId → { challenge, expiresAt }

  function storeChallenge(userId, challenge) {
    challenges.set(userId, { challenge, expiresAt: Date.now() + challengeTtlMs });
  }

  function getAndClearChallenge(userId) {
    const entry = challenges.get(userId);
    challenges.delete(userId);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) return null;
    return entry.challenge;
  }

  async function getCredentialsForUser(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM webauthn_credentials WHERE user_id = $1',
      [userId]
    );
    return rows;
  }

  return {
    async generateRegistrationOptions(userId, userEmail) {
      const existingCredentials = await getCredentialsForUser(userId);
      const opts = await generateRegistrationOptions({
        rpName,
        rpID: rpId,
        userName: userEmail,
        userDisplayName: userEmail,
        excludeCredentials: existingCredentials.map((c) => ({
          id: c.credential_id,
          type: 'public-key',
        })),
        authenticatorSelection: {
          residentKey: 'preferred',
          userVerification: 'preferred',
        },
      });
      storeChallenge(userId, opts.challenge);
      return opts;
    },

    async verifyRegistration(userId, response) {
      const expectedChallenge = getAndClearChallenge(userId);
      if (!expectedChallenge) throw new Error('Challenge expired or not found');

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
      });

      if (!verification.verified || !verification.registrationInfo) {
        throw new Error('Registration verification failed');
      }

      const { credential } = verification.registrationInfo;
      await pool.query(
        `INSERT INTO webauthn_credentials (user_id, credential_id, public_key, sign_count, aaguid)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          Buffer.from(credential.id).toString('base64url'),
          Buffer.from(credential.publicKey).toString('base64url'),
          credential.counter,
          verification.registrationInfo.aaguid ?? '',
        ]
      );

      return { ok: true };
    },

    async generateAssertionOptions(userId) {
      const credentials = await getCredentialsForUser(userId);
      const opts = await generateAuthenticationOptions({
        rpID: rpId,
        userVerification: 'preferred',
        allowCredentials: credentials.map((c) => ({
          id: c.credential_id,
          type: 'public-key',
        })),
      });
      storeChallenge(userId, opts.challenge);
      return opts;
    },

    async verifyAssertion(userId, response) {
      const expectedChallenge = getAndClearChallenge(userId);
      if (!expectedChallenge) throw new Error('Challenge expired or not found');

      const credentials = await getCredentialsForUser(userId);
      const credential = credentials.find((c) => c.credential_id === response.id);
      if (!credential) throw new Error('Credential not found');

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        credential: {
          id: credential.credential_id,
          publicKey: Buffer.from(credential.public_key, 'base64url'),
          counter: credential.sign_count,
        },
      });

      if (!verification.verified) throw new Error('Assertion verification failed');

      // Update sign count
      await pool.query(
        'UPDATE webauthn_credentials SET sign_count = $1, last_used_at = NOW() WHERE credential_id = $2',
        [verification.authenticationInfo.newCounter, credential.credential_id]
      );

      return { ok: true, userId };
    },
  };
}
