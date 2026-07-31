import nodemailer from 'nodemailer';

export class EmailService {
  /**
   * Dynamically gets Nodemailer transporter using live process.env variables
   */
  private static getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.NEXT_PUBLIC_SMTP_USER || '';
    const pass = process.env.SMTP_PASS || process.env.NEXT_PUBLIC_SMTP_PASS || '';

    return {
      transporter: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: user && pass ? { user, pass } : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      }),
      user,
      pass,
    };
  }

  /**
   * Sends Cryptographic Magic Password Reset Link Email (Method 1)
   */
  static async sendMagicResetLinkEmail(toEmail: string, name: string, resetUrl: string): Promise<{ sent: boolean; previewUrl?: string; error?: string }> {
    const { transporter, user, pass } = this.getTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 520px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 24px; padding: 36px;">
          <div style="font-size: 26px; font-weight: bold; color: #EF4444; margin-bottom: 8px;">Vyora Security</div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 0;">Secure One-Time Password Reset</p>
          <hr style="border: 0; border-top: 1px solid #1E293B; margin: 24px 0;" />
          <h2 style="font-size: 20px; color: #FFFFFF; margin-bottom: 12px;">Reset Your Password</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.6; margin-bottom: 28px;">
            Hello ${name || 'User'},<br/>
            We received a request to reset your Vyora account password. Click the secure button below to set your new password:
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #EF4444, #DC2626); color: #FFFFFF; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
            🔒 Reset My Password Now
          </a>
          <p style="font-size: 11px; color: #64748B; margin-top: 32px;">
            This single-use cryptographic reset link expires in 15 minutes.<br/>If you did not request this change, your account remains 100% secure.
          </p>
        </div>
      </div>
    `;

    try {
      if (user && pass) {
        await transporter.sendMail({
          from: `"Vyora Security" <${user}>`,
          to: toEmail,
          subject: `Reset your Vyora account password`,
          html,
        });
        console.log(`✉️ REAL GMAIL SMTP Email sent to ${toEmail} via ${user}`);
        return { sent: true };
      } else {
        console.warn('⚠️ SMTP_USER or SMTP_PASS missing in process.env. Using Ethereal test transporter.');
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail({
          from: '"Vyora Security" <security@vyora.ai>',
          to: toEmail,
          subject: `Reset your Vyora account password`,
          html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        return { sent: true, previewUrl };
      }
    } catch (err: any) {
      console.error(`Failed to send magic reset link email to ${toEmail}:`, err);
      return { sent: false, error: err.message };
    }
  }

  /**
   * Sends 6-Digit Email Verification Code
   */
  static async sendVerificationEmail(toEmail: string, name: string, otp: string): Promise<{ sent: boolean; previewUrl?: string }> {
    const { transporter, user, pass } = this.getTransporter();

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 20px; padding: 32px;">
          <div style="font-size: 24px; font-weight: bold; color: #3B82F6; margin-bottom: 8px;">Vyora SaaS</div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 0;">AI Personal Finance OS</p>
          <hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />
          <h2 style="font-size: 18px; color: #FFFFFF; margin-bottom: 12px;">Email Verification Code</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.5;">Hello ${name || 'User'},<br/>Your 6-digit email verification code is:</p>
          <div style="font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #60A5FA; background: #1E293B; padding: 16px; border-radius: 12px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748B;">This OTP code expires in 10 minutes.</p>
        </div>
      </div>
    `;

    try {
      if (user && pass) {
        await transporter.sendMail({
          from: `"Vyora Security" <${user}>`,
          to: toEmail,
          subject: `${otp} is your Vyora Email Verification Code`,
          html,
        });
        return { sent: true };
      } else {
        const testAccount = await nodemailer.createTestAccount();
        const testTransporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });

        const info = await testTransporter.sendMail({
          from: '"Vyora Security" <security@vyora.ai>',
          to: toEmail,
          subject: `${otp} is your Vyora Email Verification Code`,
          html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        return { sent: true, previewUrl };
      }
    } catch (err) {
      console.error(`Failed to send verification email to ${toEmail}:`, err);
      return { sent: false };
    }
  }
}
