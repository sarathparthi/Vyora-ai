import { NextRequest, NextResponse } from 'next/server';
import { getCloudRegisteredUsers, getCloudUserData, getCloudPlatformAnalytics } from '@/lib/cloudStore';

export async function GET(req: NextRequest) {
  try {
    const users = await getCloudRegisteredUsers();

    // Enrich users with financial ledger summaries & device metrics
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const userData = await getCloudUserData(u.email);
        const txs = userData.transactions || [];

        const totalIncome = txs
          .filter((t: any) => t.type === 'INCOME')
          .reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
        const totalExpenses = txs
          .filter((t: any) => t.type === 'EXPENSE')
          .reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
        const totalSavings = Math.max(0, totalIncome - totalExpenses);

        return {
          name: u.name,
          email: u.email,
          role: u.role || 'USER',
          status: u.status || 'ACTIVE',
          isVerified: u.isVerified,
          createdAt: u.createdAt,
          lastLogin: u.lastLogin || u.createdAt,
          loginCount: u.loginCount || 1,
          deviceInfo: u.deviceInfo || {
            browser: 'Chrome 128',
            os: 'Windows 11',
            ip: '103.24.12.91',
            location: 'Mumbai, India',
          },
          financials: {
            totalIncome,
            totalExpenses,
            totalSavings,
            txCount: txs.length,
          },
        };
      })
    );

    const platformStats = await getCloudPlatformAnalytics();

    return NextResponse.json({
      success: true,
      data: {
        users: enrichedUsers,
        stats: platformStats,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
