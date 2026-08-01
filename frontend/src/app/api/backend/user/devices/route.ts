import { NextRequest, NextResponse } from 'next/server';
import { getCloudUserDevices, revokeCloudDeviceSession, revokeCloudAllOtherDevices } from '@/lib/cloudStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    const devices = await getCloudUserDevices(email);

    return NextResponse.json({
      success: true,
      data: devices,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, deviceId, action } = body;

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }

    let devices = [];
    if (action === 'REVOKE_ALL_OTHERS') {
      devices = await revokeCloudAllOtherDevices(email);
    } else if (deviceId) {
      devices = await revokeCloudDeviceSession(email, deviceId);
    } else {
      return NextResponse.json({ success: false, message: 'Invalid device operation.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Device session revoked successfully.',
      data: devices,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
