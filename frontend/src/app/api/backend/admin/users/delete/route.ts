import { NextRequest, NextResponse } from 'next/server';
import { deleteCloudUser } from '@/lib/cloudStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email address is required.' }, { status: 400 });
    }

    const ok = await deleteCloudUser(email);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Cannot delete super admin or user not found.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'User account successfully deleted.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
