import { NextRequest, NextResponse } from 'next/server';
import { logsStore } from '@/lib/emailLogsStore';

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: logsStore,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, data: [] });
  }
}
