import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

let emailLogs: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.NEXT_PUBLIC_SMTP_USER || '';
    const pass = process.env.SMTP_PASS || process.env.NEXT_PUBLIC_SMTP_PASS || '';

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 20px; padding: 32px;">
          <div style="font-size: 24px; font-weight: bold; color: #EF4444; margin-bottom: 8px;">Vyora Security</div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 0;">Password Reset Request</p>
          <hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />
          <h2 style="font-size: 18px; color: #FFFFFF; margin-bottom: 12px;">Password Reset OTP</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.5;">Hello User,<br/>Your 6-digit password reset OTP code is:</p>
          <div style="font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #F87171; background: #1E293B; padding: 16px; border-radius: 12px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748B;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `;

    if (user && pass) {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });

      await transporter.sendMail({
        from: `"Vyora Security" <${user}>`,
        to: emailLower,
        subject: `${otp} is your Vyora Password Reset OTP`,
        html,
      });

      const log = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        toEmail: emailLower,
        otp,
        status: 'SUCCESS',
        smtpUser: user,
      };

      emailLogs.unshift(log);

      return NextResponse.json({
        success: true,
        data: {
          message: 'A 6-digit password reset OTP code has been sent directly to your email address.',
          email: emailLower,
        },
      });
    } else {
      const log = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        toEmail: emailLower,
        otp,
        status: 'SIMULATED',
        smtpUser: 'Ethereal Test SMTP (No SMTP_USER set)',
      };

      emailLogs.unshift(log);

      return NextResponse.json({
        success: true,
        data: {
          message: 'A 6-digit password reset OTP code has been generated.',
          otpDemo: otp,
          email: emailLower,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
