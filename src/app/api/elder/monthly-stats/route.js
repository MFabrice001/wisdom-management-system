import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ELDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get monthly wisdom counts for the current elder
    const monthlyStats = await Promise.all(
      months.map(async (month, index) => {
        const startDate = new Date(currentYear, index, 1);
        const endDate = new Date(currentYear, index + 1, 0);
        
        const count = await prisma.wisdom.count({
          where: {
            authorId: session.user.id,
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });
        
        return {
          month,
          activities: count
        };
      })
    );

    return NextResponse.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}