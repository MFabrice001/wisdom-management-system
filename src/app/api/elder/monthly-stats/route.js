import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'ELDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyData = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 0);
        
        const [wisdomCount, meetingCount] = await Promise.all([
          prisma.wisdom.count({
            where: {
              authorId: session.user.id,
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }),
          prisma.meeting.count({
            where: {
              hostId: session.user.id,
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          })
        ]);
        
        return {
          month,
          activities: wisdomCount + meetingCount
        };
      })
    );

    return NextResponse.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}