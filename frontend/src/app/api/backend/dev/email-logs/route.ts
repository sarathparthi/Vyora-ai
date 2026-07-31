import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: [] });
  }
}
