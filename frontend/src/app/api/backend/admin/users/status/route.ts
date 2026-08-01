import { NextRequest, NextResponse } from 'next/server';
import { setCloudUserStatus } from '@/lib/cloudStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, status } = body;

    if (!email || !status) {
      return NextResponse.json({ success: false, message: 'Email and status are required.' }, { status: 400 });
    }

    const ok = await setCloudUserStatus(email, status);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `User status updated to ${status}.` });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
