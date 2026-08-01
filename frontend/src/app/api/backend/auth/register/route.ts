import { NextRequest, NextResponse } from 'next/server';
import { findCloudUserByEmail, saveCloudRegisteredUser } from '@/lib/cloudStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists in cloud store
    const existingUser = await findCloudUserByEmail(emailLower);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email address already exists. Please sign in.' },
        { status: 409 }
      );
    }

    const isRootAdmin = emailLower === 'admin@vyoraai.in';

    // Save new user account to cloud store (unverified initially)
    const newUser = {
      name: name.trim(),
      email: emailLower,
      password: password,
      role: (isRootAdmin ? 'SUPER_ADMIN' : 'USER') as 'SUPER_ADMIN' | 'USER',
      status: 'ACTIVE' as 'ACTIVE' | 'SUSPENDED',
      isVerified: false,
      createdAt: new Date().toISOString(),
    };

    await saveCloudRegisteredUser(newUser);

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully. Verification OTP dispatched.',
      data: {
        user: { name: newUser.name, email: newUser.email, role: newUser.role, isVerified: false },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
