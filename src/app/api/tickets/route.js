import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { 
  createTicket,
  getTickets,
  getTicketStats
} from '@/services/ticketService';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Set requestor to current user if not specified
    if (!body.requestor) {
      body.requestor = session.user.id;
    }
    
    // Validate required fields
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const ticket = await createTicket(body);
    
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const query = {
      page: searchParams.get('page') || 1,
      limit: searchParams.get('limit') || 10,
      status: searchParams.get('status'),
      priority: searchParams.get('priority'),
      category: searchParams.get('category'),
      assignee: searchParams.get('assignee'),
      requestor: searchParams.get('requestor'),
      search: searchParams.get('search'),
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc'
    };
    
    // If the stats parameter is provided, return ticket statistics
    if (searchParams.get('stats') === 'true') {
      const stats = await getTicketStats();
      return NextResponse.json(stats);
    }
    
    const result = await getTickets(query);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
} 