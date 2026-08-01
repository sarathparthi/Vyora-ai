import { NextRequest, NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/otpStore';
import { findCloudUserByEmail, saveCloudRegisteredUser } from '@/lib/cloudStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required.' },
        { status: 400 }
      );
    }

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP — must be exactly 6 digits.' },
        { status: 400 }
      );
    }

    // Validate against server-side OTP store
    const result = verifyOTP(`verify_${email.toLowerCase().trim()}`, otp);

    if (!result.valid) {
      return NextResponse.json(
        { success: false, message: result.reason || 'Invalid or expired OTP code.' },
        { status: 401 }
      );
    }

    // Mark user as verified in global cloud store
    const user = await findCloudUserByEmail(email);
    if (user) {
      user.isVerified = true;
      await saveCloudRegisteredUser(user);
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now sign in on any device.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
