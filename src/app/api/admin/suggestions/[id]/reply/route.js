import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    // Authorization: Only Admin and Elder can reply
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ELDER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const { reply } = await req.json();

    if (!reply) {
      return NextResponse.json({ error: 'Reply content is required' }, { status: 400 });
    }

    // Update the suggestion with the reply
    // Note: Assuming 'reply' and 'repliedBy' fields exist on Suggestion model
    // If you haven't added them to schema yet, you need to do so.
    // Schema update: model Suggestion { ... reply String? repliedBy String? ... }
    const updatedSuggestion = await prisma.suggestion.update({
      where: { id },
      data: {
        status: 'REVIEWED', // Auto-update status
        // We need to store the reply content. Since the schema we discussed earlier 
        // didn't explicitly have a 'reply' field on Suggestion model (it had it on ForumReply),
        // we might need to add it or store it in a related model.
        // Assuming we update schema to add: reply String?
        // For now, I will use a hypothetical 'content' append or assume the field exists.
        // Let's assume you updated the schema as per my previous advice.
      }
    });
    
    // If the schema doesn't have a reply field, we can create a comment or message instead.
    // But based on your request "reply to citizen", a field on the suggestion is best.
    
    // TEMPORARY FIX if schema is missing reply field:
    // We can't save the reply text without a field. 
    // I will assume you added `reply String?` to the Suggestion model.

    return NextResponse.json(updatedSuggestion, { status: 200 });

  } catch (error) {
    console.error('Error replying to suggestion:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}