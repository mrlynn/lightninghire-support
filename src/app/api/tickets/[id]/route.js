import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  getTicketById,
  updateTicket,
  deleteTicket
} from '@/services/ticketService';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const ticketId = params.id;
    const ticket = await getTicketById(ticketId);
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch ticket' },
      { status: error.message === 'Ticket not found' ? 404 : 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to update tickets
    // TODO: Implement proper permission checks
    
    const ticketId = params.id;
    const body = await request.json();
    
    const ticket = await updateTicket(ticketId, body);
    
    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update ticket' },
      { status: error.message === 'Ticket not found' ? 404 : 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user has permission to delete tickets
    // TODO: Implement proper permission checks
    
    const ticketId = params.id;
    await deleteTicket(ticketId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete ticket' },
      { status: error.message === 'Ticket not found' ? 404 : 500 }
    );
  }
} 