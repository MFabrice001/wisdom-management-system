import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

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

    const [contacts, total, elderConversations] = await Promise.all([
      prisma.contactMessage.findMany({
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
      prisma.contactMessage.count({ where }),
      // Also fetch conversations with elder applicants
      prisma.conversation.findMany({
        where: {
          participants: {
            some: {
              role: 'ELDER'
            }
          }
        },
        include: {
          participants: { select: { id: true, name: true, email: true, role: true } },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    ]);

    // Format conversations as contact-like entries
    const conversationContacts = elderConversations.map(conv => {
      const elder = conv.participants.find(p => p.role === 'ELDER');
      const lastMsg = conv.messages[0];
      return {
        id: `conv_${conv.id}`,
        isConversation: true,
        conversationId: conv.id,
        name: elder?.name || 'Elder Applicant',
        email: elder?.email || '',
        subject: 'Elder Application Conversation',
        message: lastMsg?.content || 'No messages yet',
        status: lastMsg?.senderId === elder?.id ? 'NEW' : 'REPLIED',
        createdAt: conv.updatedAt,
        _count: { replies: conv.messages.length }
      };
    });

    // Combine contacts and conversations
    const allContacts = [...contacts, ...conversationContacts];
    // Sort by date
    allContacts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({
      contacts: allContacts,
      pagination: {
        page,
        limit,
        total: total + elderConversations.length,
        pages: Math.ceil((total + elderConversations.length) / limit)
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

    // Handle conversation replies
    if (contactId && contactId.startsWith('conv_')) {
      const conversationId = contactId.replace('conv_', '');
      
      if (action === 'reply' && replyMessage) {
        // Get conversation details
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: {
            participants: true
          }
        });

        if (!conversation) {
          return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Add message to conversation
        await prisma.message.create({
          data: {
            content: replyMessage,
            senderId: session.user.id,
            conversationId: conversation.id
          }
        });

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

        return NextResponse.json({ success: true });
      }

      if (action === 'delete') {
        // Don't actually delete conversation, just return success
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: 'Invalid action for conversation' }, { status: 400 });
    }

    if (action === 'reply' && replyMessage) {
      // Get contact details for email
      const contact = await prisma.contactMessage.findUnique({
        where: { id: contactId }
      });

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }

      // Add reply to contact
      await prisma.contactReply.create({
        data: {
          contactId,
          message: replyMessage,
          adminId: session.user.id
        }
      });

      // Update contact status to replied
      await prisma.contactMessage.update({
        where: { id: contactId },
        data: { 
          status: 'REPLIED',
          repliedAt: new Date()
        }
      });

      // Send email reply to user
      await sendReplyEmail(contact, replyMessage);

      return NextResponse.json({ success: true });
    }

    if (action === 'mark_read') {
      await prisma.contactMessage.update({
        where: { id: contactId },
        data: { status: 'READ' }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await prisma.contactMessage.delete({
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

async function sendReplyEmail(contact, replyMessage) {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #2563eb; text-align: center;">Reply to Your Contact Message - Umurage Wubwenge</h2>
        <p>Dear ${contact.name},</p>
        <p>Thank you for contacting us. We have received your message regarding "<strong>${contact.subject}</strong>" and here is our response:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0;">Our Response:</h3>
          <p style="white-space: pre-wrap;">${replyMessage}</p>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1e40af; margin-top: 0;">Your Original Message:</h4>
          <p style="color: #64748b; font-style: italic;">${contact.message}</p>
        </div>
        
        <p>If you have any further questions, please don't hesitate to contact us again.</p>
        <p>Best regards,<br><strong>Umurage Wubwenge Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: contact.email,
      subject: `Re: ${contact.subject} - Umurage Wubwenge`,
      html: htmlContent
    });
    
    console.log(`Reply email sent successfully to ${contact.email}`);
  } catch (error) {
    console.error('Error sending reply email:', error);
  }
}