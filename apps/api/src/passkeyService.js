import {
  generateRegistrationOptions as genRegOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions as genAssertOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';

/**
 * Factory for WebAuthn passkey operations.
 * @param {{ pool: import('pg').Pool, config: object }} deps
 */
export function createPasskeyService({ pool, config }) {
  const { rpId, rpName, origin, challengeTtlMs } = config.webauthn;

  async function generateRegistrationOptions(userId, userEmail) {
    const options = await genRegOptions({
      rpName,
      rpID: rpId,
      userID: new TextEncoder().encode(userId),
      userName: userEmail,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await pool.query(
      `INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
       VALUES ($1, $2, 'registration', NOW() + $3::interval)`,
      [userId, options.challenge, `${challengeTtlMs} milliseconds`],
    );

    return options;
  }

  async function verifyRegistration(userId, response) {
    const { rows } = await pool.query(
      `SELECT challenge FROM webauthn_challenges
       WHERE user_id = $1 AND type = 'registration' AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [userId],
    );
    if (!rows.length) return { verified: false, error: 'no_pending_challenge' };

    const expectedChallenge = rows[0].challenge;
    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        requireUserVerification: false,
      });
    } catch {
      return { verified: false };
    }

    if (!verification.verified || !verification.registrationInfo) {
      return { verified: false };
    }

    await pool.query(
      `DELETE FROM webauthn_challenges WHERE user_id = $1 AND type = 'registration'`,
      [userId],
    );

    const { credential } = verification.registrationInfo;
    const publicKeyB64 = Buffer.from(credential.publicKey).toString('base64');

    await pool.query(
      `INSERT INTO webauthn_credentials
         (user_id, credential_id, public_key, sign_count, transports)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (credential_id) DO UPDATE
         SET sign_count = EXCLUDED.sign_count, updated_at = NOW()`,
      [userId, credential.id, publicKeyB64, credential.counter, JSON.stringify(credential.transports ?? [])],
    );

    return { verified: true };
  }

  async function generateAssertionOptions(userId) {
    const { rows } = await pool.query(
      'SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1',
      [userId],
    );

    const allowCredentials = rows.map((r) => ({
      id: r.credential_id,
      transports: r.transports,
    }));

    const options = await genAssertOptions({
      rpID: rpId,
      allowCredentials,
      userVerification: 'preferred',
    });

    await pool.query(
      `INSERT INTO webauthn_challenges (user_id, challenge, type, expires_at)
       VALUES ($1, $2, 'assertion', NOW() + $3::interval)`,
      [userId, options.challenge, `${challengeTtlMs} milliseconds`],
    );

    return options;
  }

  async function verifyAssertion(userId, response) {
    const { rows: challengeRows } = await pool.query(
      `SELECT challenge FROM webauthn_challenges
       WHERE user_id = $1 AND type = 'assertion' AND expires_at > NOW()
       ORDER BY expires_at DESC LIMIT 1`,
      [userId],
    );
    if (!challengeRows.length) return { verified: false, error: 'no_pending_challenge' };

    const expectedChallenge = challengeRows[0].challenge;

    const { rows: credRows } = await pool.query(
      'SELECT * FROM webauthn_credentials WHERE user_id = $1 AND credential_id = $2',
      [userId, response.id],
    );
    if (!credRows.length) return { verified: false, error: 'credential_not_found' };

    const storedCred = credRows[0];
    const publicKey = new Uint8Array(Buffer.from(storedCred.public_key, 'base64'));

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        credential: {
          id: storedCred.credential_id,
          publicKey,
          counter: Number(storedCred.sign_count),
          transports: storedCred.transports,
        },
        requireUserVerification: false,
      });
    } catch {
      return { verified: false };
    }

    if (!verification.verified) return { verified: false };

    await pool.query(
      `DELETE FROM webauthn_challenges WHERE user_id = $1 AND type = 'assertion'`,
      [userId],
    );

    await pool.query(
      `UPDATE webauthn_credentials
       SET sign_count = $1, last_used_at = NOW(), updated_at = NOW()
       WHERE credential_id = $2`,
      [verification.authenticationInfo.newCounter, storedCred.credential_id],
    );

    return { verified: true, userId };
  }

  return { generateRegistrationOptions, verifyRegistration, generateAssertionOptions, verifyAssertion };
}
