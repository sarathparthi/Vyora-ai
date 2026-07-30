import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

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
  static async sendVerificationEmail(toEmail: string, name: string, otp: string): Promise<boolean> {
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
          <p style="font-size: 11px; color: #64748B;">This OTP code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: `"Vyora Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: `${otp} is your Vyora Email Verification Code`,
          html,
        });
        console.log(`✉️ Verification OTP email sent to ${toEmail}`);
      } else {
        console.log(`✉️ [SIMULATED EMAIL DISPATCH] Verification OTP for ${toEmail}: ${otp}`);
      }
      return true;
    } catch (err) {
      console.error(`Failed to send verification email to ${toEmail}:`, err);
      return false;
    }
  }

  /**
   * Sends 6-Digit Password Reset OTP Code
   */
  static async sendPasswordResetEmail(toEmail: string, name: string, otp: string): Promise<boolean> {
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
          <p style="font-size: 11px; color: #64748B;">This code expires in 10 minutes. If you did not request a password reset, your account is safe.</p>
        </div>
      </div>
    `;

    try {
      if (process.env.SMTP_USER) {
        await this.transporter.sendMail({
          from: `"Vyora Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: `${otp} is your Vyora Password Reset OTP`,
          html,
        });
        console.log(`✉️ Password reset OTP email sent to ${toEmail}`);
      } else {
        console.log(`✉️ [SIMULATED EMAIL DISPATCH] Password reset OTP for ${toEmail}: ${otp}`);
      }
      return true;
    } catch (err) {
      console.error(`Failed to send reset email to ${toEmail}:`, err);
      return false;
    }
  }
}
