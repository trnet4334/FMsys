import { Resend } from 'resend';

export function createEmailService(config, resendClient = null) {
  const resend = resendClient ?? new Resend(config.resendApiKey);
  const from = config.emailFrom;
  const appUrl = config.appUrl;

  return {
    async sendVerificationEmail(email, tokenValue) {
      const url = `${appUrl}/verify-email?token=${tokenValue}`;
      await resend.emails.send({
        from,
        to: email,
        subject: 'Verify your FMsys account',
        html: `<p>Click the link below to verify your email:</p><p><a href="${url}">Verify Email</a></p><p>This link expires in 15 minutes.</p>`,
      });
    },

    async sendPasswordResetEmail(email, tokenValue) {
      const url = `${appUrl}/reset-password?token=${tokenValue}`;
      await resend.emails.send({
        from,
        to: email,
        subject: 'Reset your FMsys password',
        html: `<p>Click the link below to reset your password:</p><p><a href="${url}">Reset Password</a></p><p>This link expires in 15 minutes. If you didn't request this, ignore this email.</p>`,
      });
    },

    async sendNewDeviceAlert(email, { device, ip, time }) {
      await resend.emails.send({
        from,
        to: email,
        subject: 'New device sign-in to FMsys',
        html: `<p>A new device signed in to your FMsys account:</p><ul><li>Device: ${device}</li><li>IP: ${ip}</li><li>Time: ${time.toISOString()}</li></ul><p>If this wasn't you, change your password immediately.</p>`,
      });
    },
  };
}
