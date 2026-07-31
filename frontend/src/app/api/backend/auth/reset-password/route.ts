import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otpStore';

// Minimum password complexity check (mirrors the frontend rules)
function isPasswordValid(password: string): boolean {
  return (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[@$!%*?&!#^()\-=_+]/.test(password)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and new password are required.' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP — must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    if (!isPasswordValid(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must be at least 12 characters and include uppercase, lowercase, number, and special character.',
        },
        { status: 400 }
      );
    }

    // Validate OTP against the server-side store
    const result = verifyOTP(email, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.reason || 'Invalid or expired OTP.' },
        { status: 401 }
      );
    }

    // OTP is valid — the frontend localStorage layer handles the actual password update.
    // This response tells the frontend the OTP was verified successfully.
    return NextResponse.json({
      success: true,
      message: 'OTP verified. Password reset successfully — please sign in with your new password.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
