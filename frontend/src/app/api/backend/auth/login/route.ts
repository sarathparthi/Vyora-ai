import { NextRequest, NextResponse } from 'next/server';
import { findCloudUserByEmail, getCloudUserData } from '@/lib/cloudStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email address and password are required.' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Query global cloud store
    const user = await findCloudUserByEmail(emailLower);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'This email address is not registered. Please create an account first.' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          isUnverified: true,
          message: 'Your email address is not verified. Please verify your 6-digit OTP code to continue.',
        },
        { status: 403 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    // Fetch user's financial ledger data from cloud
    const userData = await getCloudUserData(emailLower);
    const accessToken = `vyora_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: { name: user.name, email: user.email, role: 'USER' },
        userData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
