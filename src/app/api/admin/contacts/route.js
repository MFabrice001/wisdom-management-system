import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { replies: true }
          }
        }
      }),
      prisma.contact.count({ where })
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contactId, action, replyMessage } = await request.json();

    if (action === 'reply' && replyMessage) {
      // Add reply to contact
      await prisma.contactReply.create({
        data: {
          contactId,
          message: replyMessage,
          adminId: session.user.id
        }
      });

      // Update contact status to replied
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'REPLIED' }
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'mark_read') {
      await prisma.contact.update({
        where: { id: contactId },
        data: { status: 'READ' }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await prisma.contact.delete({
        where: { id: contactId }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error handling contact action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}