import { NextRequest, NextResponse } from 'next/server';
import { getCloudUserData, saveCloudUserData } from '@/lib/cloudStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email param required' }, { status: 400 });
    }

    const userData = await getCloudUserData(email);
    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, data } = body;

    if (!email || !data) {
      return NextResponse.json({ success: false, message: 'Email and data required' }, { status: 400 });
    }

    await saveCloudUserData(email, data);
    return NextResponse.json({
      success: true,
      message: 'User financial data synced to cloud successfully.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
