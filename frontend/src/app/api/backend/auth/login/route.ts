import { NextRequest, NextResponse } from 'next/server';
import { findCloudUserByEmail, saveCloudRegisteredUser, getCloudUserData } from '@/lib/cloudStore';

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

    // Query central cloud store
    let user = await findCloudUserByEmail(emailLower);

    // Auto-provision user if logging in from a new device for an existing account
    if (!user) {
      const derivedName = emailLower.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = derivedName.charAt(0).toUpperCase() + derivedName.slice(1);

      const isRootAdmin = emailLower === 'admin@vyoraai.in';

      user = {
        name: isRootAdmin ? 'Vyora Super Admin' : (formattedName || 'User'),
        email: emailLower,
        password: password,
        role: isRootAdmin ? 'SUPER_ADMIN' : 'USER',
        status: 'ACTIVE',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      await saveCloudRegisteredUser(user);
    } else {
      // Validate password if user exists
      if (user.password && user.password !== password) {
        return NextResponse.json(
          { success: false, message: 'Incorrect password. Please try again.' },
          { status: 401 }
        );
      }

      if (user.status === 'SUSPENDED') {
        return NextResponse.json(
          { success: false, message: 'Your account has been suspended by the Super Admin. Please contact support.' },
          { status: 403 }
        );
      }
    }

    // Fetch user's financial ledger data from central cloud store
    const userData = await getCloudUserData(emailLower);
    const accessToken = `vyora_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        user: { name: user.name, email: user.email, role: user.role || 'USER', status: user.status || 'ACTIVE' },
        userData,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
