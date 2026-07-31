import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { addEmailLog } from '@/lib/emailLogsStore';
import { storeOTP } from '@/lib/otpStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP server-side with 10-minute expiry
    storeOTP(`verify_${emailLower}`, otp, 10 * 60 * 1000);

    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER || process.env.NEXT_PUBLIC_SMTP_USER || '';
    const pass = process.env.SMTP_PASS || process.env.NEXT_PUBLIC_SMTP_PASS || '';

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #0B0F17; color: #F8FAFC; padding: 40px 20px; text-align: center;">
        <div style="max-width: 480px; margin: 0 auto; background: #0F172A; border: 1px solid #1E293B; border-radius: 20px; padding: 32px;">
          <div style="font-size: 24px; font-weight: bold; color: #3B82F6; margin-bottom: 8px;">Vyora</div>
          <p style="font-size: 12px; color: #94A3B8; margin-top: 0;">Email Verification</p>
          <hr style="border: 0; border-top: 1px solid #1E293B; margin: 20px 0;" />
          <h2 style="font-size: 18px; color: #FFFFFF; margin-bottom: 12px;">Verify Your Email Address</h2>
          <p style="font-size: 13px; color: #94A3B8; line-height: 1.5;">
            Welcome to Vyora! Please use the code below to verify your email address and complete your account setup.
          </p>
          <div style="font-size: 32px; font-family: monospace; font-weight: bold; letter-spacing: 8px; color: #60A5FA; background: #1E293B; padding: 16px; border-radius: 12px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #64748B;">This code expires in 10 minutes. Do not share it with anyone.</p>
          <p style="font-size: 11px; color: #64748B; margin-top: 16px;">If you did not create a Vyora account, please ignore this email.</p>
        </div>
      </div>
    `;

    if (user && pass) {
      try {
        const transporter = nodemailer.createTransport({
          host,
          port,
          secure: false,
          requireTLS: true,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });

        await transporter.sendMail({
          from: `"Vyora" <${user}>`,
          to: emailLower,
          subject: `${otp} — Verify your Vyora account`,
          html,
        });

        addEmailLog({
          toEmail: emailLower,
          otp,
          status: 'SUCCESS',
          smtpUser: user,
        });

        return NextResponse.json({
          success: true,
          data: {
            message: `A 6-digit verification code has been sent to ${emailLower}.`,
            email: emailLower,
          },
        });
      } catch (smtpErr: any) {
        addEmailLog({
          toEmail: emailLower,
          otp,
          status: 'FAILED',
          smtpUser: user,
          error: smtpErr.message,
        });

        return NextResponse.json({
          success: true,
          data: {
            message: 'Verification OTP generated (email delivery failed — use Dev Logs to retrieve it).',
            otpDemo: otp,
            email: emailLower,
          },
        });
      }
    } else {
      addEmailLog({
        toEmail: emailLower,
        otp,
        status: 'SIMULATED',
        smtpUser: 'None (SMTP_USER/SMTP_PASS missing)',
      });

      return NextResponse.json({
        success: true,
        data: {
          message: 'Verification OTP generated (no SMTP configured — check Dev Logs).',
          otpDemo: otp,
          email: emailLower,
        },
      });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
