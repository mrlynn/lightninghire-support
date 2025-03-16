import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { addTicketComment } from '@/services/ticketService';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const ticketId = params.id;
    const body = await request.json();
    
    // Set the creator to the current user ID
    body.createdBy = session.user.id;
    
    // Add author information for denormalized access and historical purposes
    body.authorInfo = {
      name: session.user.name,
      email: session.user.email,
      role: session.user.role || 'user'
    };
    
    // Validate required fields
    if (!body.content) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }
    
    const ticket = await addTicketComment(ticketId, body);
    
    // Return only the new comment (the last one)
    const newComment = ticket.comments[ticket.comments.length - 1];
    
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: error.message === 'Ticket not found' ? 404 : 500 }
    );
  }
} 