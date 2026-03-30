import { Resend } from 'resend';

/**
 * Factory for email sending operations via Resend.
 * @param {{ resendApiKey: string, emailFrom: string, appUrl: string }} config
 * @param {object} [resendClient] - Optional Resend client for testing (dependency injection)
 */
export function createEmailService(config, resendClient) {
  const resend = resendClient ?? (config.resendApiKey ? new Resend(config.resendApiKey) : null);
  const from = config.emailFrom;
  const appUrl = config.appUrl;

  async function send(params) {
    if (!resend) {
      // eslint-disable-next-line no-console
      console.warn('[email] No RESEND_API_KEY set — skipping email to', params.to);
      return;
    }
    await resend.emails.send(params);
  }

  return {
    async sendVerificationEmail(email, tokenValue) {
      const url = `${appUrl}/verify-email?token=${tokenValue}`;
      await send({
        from,
        to: email,
        subject: 'Verify your FMsys account',
        html: `<p>Click the link below to verify your email:</p><p><a href="${url}">Verify Email</a></p><p>This link expires in 15 minutes.</p>`,
      });
    },

    async sendPasswordResetEmail(email, tokenValue) {
      const url = `${appUrl}/reset-password?token=${tokenValue}`;
      await send({
        from,
        to: email,
        subject: 'Reset your FMsys password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${url}">Reset Password</a></p><p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
      });
    },

    async sendNewDeviceAlert(email, { device, ip, time }) {
      await send({
        from,
        to: email,
        subject: 'New device sign-in to FMsys',
        html: `<p>A new device signed in to your FMsys account:</p><ul><li>Device: ${device}</li><li>IP: ${ip}</li><li>Time: ${time.toISOString()}</li></ul><p>If this wasn't you, change your password immediately.</p>`,
      });
    },
  };
}
