import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, message: 'Email, OTP, and new password are required.' }, { status: 400 });
    }

    if (otp.length !== 6) {
      return NextResponse.json({ success: false, message: 'Invalid 6-digit OTP code.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
