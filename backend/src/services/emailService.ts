import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  });

  /**
   * Sends 6-Digit Email Verification OTP Code
   */
  static async sendVerificationEmail(toEmail: string, name: string, otp: string): Promise<{ sent: boolean; previewUrl?: string }> {
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
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await this.transporter.sendMail({
          from: `"Vyora Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: `${otp} is your Vyora Email Verification Code`,
          html,
        });
        console.log(`✉️ Real SMTP Email sent to ${toEmail}`);
        return { sent: true };
      } else {
        // Fallback Test Transporter (Ethereal Email)
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
        console.log(`✉️ Test Email Preview URL: ${previewUrl}`);
        return { sent: true, previewUrl };
      }
    } catch (err) {
      console.error(`Failed to send verification email to ${toEmail}:`, err);
      return { sent: false };
    }
  }

  /**
   * Sends 6-Digit Password Reset OTP Code
   */
  static async sendPasswordResetEmail(toEmail: string, name: string, otp: string): Promise<{ sent: boolean; previewUrl?: string }> {
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 20px; padding: 32px;">
          <div style="font-size: 24px; font-weight: bold; color: #EF4444; margin-bottom: 8px;">Vyora Security</div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 0;">Password Reset Request</p>
          <hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />
          <h2 style="font-size: 18px; color: #FFFFFF; margin-bottom: 12px;">Password Reset OTP</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.5;">Hello ${name || 'User'},<br/>Your 6-digit password reset OTP code is:</p>
          <div style="font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #F87171; background: #1E293B; padding: 16px; border-radius: 12px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748B;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await this.transporter.sendMail({
          from: `"Vyora Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: `${otp} is your Vyora Password Reset OTP`,
          html,
        });
        console.log(`✉️ Real SMTP Password reset email sent to ${toEmail}`);
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
          subject: `${otp} is your Vyora Password Reset OTP`,
          html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        console.log(`✉️ Test Reset Email Preview URL: ${previewUrl}`);
        return { sent: true, previewUrl };
      }
    } catch (err) {
      console.error(`Failed to send reset email to ${toEmail}:`, err);
      return { sent: false };
    }
  }
}
