import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';

// Import User model
let User;
try {
  User = require('@/models/User').default;
} catch (error) {
  console.warn('User model not found in current app, will try to use User from shared database');
}

export async function POST(request) {
  try {
    // This endpoint can be called with an API key for server-to-server communication
    // or with a user session for client-side requests
    const apiKey = request.headers.get('x-api-key');
    const isValidApiKey = apiKey === process.env.API_KEY;
    
    let userId;
    
    if (isValidApiKey) {
      // Server-to-server call with API key, extract userId from body
      const { userId: bodyUserId } = await request.json();
      userId = bodyUserId;
    } else {
      // Client call, get user from session
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized. Authentication required.' },
          { status: 401 }
        );
      }
      
      userId = session.user.id;
    }
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If we couldn't import User model, try to get it from the mongoose models
    const mongoose = await import('mongoose');
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Get data from request body
    const { mainAppData } = await request.json();
    
    if (!mainAppData) {
      return NextResponse.json(
        { message: 'Main app data is required' },
        { status: 400 }
      );
    }
    
    // Update user's mainAppActivity
    user.mainAppActivity = {
      ...user.mainAppActivity || {},
      ...mainAppData,
      lastSync: new Date()
    };
    
    // Update subscription info if provided
    if (mainAppData.subscriptionPlan) {
      user.subscriptionPlan = mainAppData.subscriptionPlan;
    }
    
    // Update other relevant user fields
    if (mainAppData.name) user.name = mainAppData.name;
    if (mainAppData.image) user.image = mainAppData.image;
    if (mainAppData.email) user.email = mainAppData.email;
    
    // Save user
    await user.save();
    
    return NextResponse.json({
      message: 'User data synced successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        subscriptionPlan: user.subscriptionPlan
      }
    });
    
  } catch (error) {
    console.error('Error syncing user data:', error);
    return NextResponse.json(
      { message: 'An error occurred while syncing user data' },
      { status: 500 }
    );
  }
}

// API endpoint to retrieve support data for main app
export async function GET(request) {
  try {
    // Check API key for server-to-server communication
    const apiKey = request.headers.get('x-api-key');
    
    if (apiKey !== process.env.API_KEY) {
      // Try getting user from session if no API key
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user?.id) {
        return NextResponse.json(
          { message: 'Unauthorized. Valid API key or authentication required.' },
          { status: 401 }
        );
      }
    }
    
    // Get user ID from query parameter
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If we couldn't import User model, try to get it from the mongoose models
    const mongoose = await import('mongoose');
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user and select only support-related fields
    const user = await User.findById(userId).select('supportStats supportActivity knowledgeProfile lastSupportActivity').lean();
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create a response with only the necessary support data
    const supportData = {
      userId: user._id.toString(),
      supportStats: user.supportStats || {
        articlesRead: 0,
        feedbackGiven: 0,
        ticketsCreated: 0
      },
      lastSupportActivity: user.lastSupportActivity,
      knowledgeProfile: {
        interests: user.knowledgeProfile?.interests || [],
        expertise: user.knowledgeProfile?.expertise || []
      },
      // Include summary of recent activity
      recentActivity: {
        recentSearches: user.supportActivity?.searchHistory?.slice(-5) || [],
        recentArticles: user.supportActivity?.articleViews?.slice(-5).map(view => ({
          title: view.title,
          timestamp: view.timestamp,
          helpful: view.helpful
        })) || [],
        openTickets: (user.supportActivity?.supportTickets || [])
          .filter(ticket => !ticket.resolved)
          .map(ticket => ({
            id: ticket.ticketId,
            title: ticket.title,
            status: ticket.status,
            timestamp: ticket.timestamp
          }))
      }
    };
    
    return NextResponse.json(supportData);
    
  } catch (error) {
    console.error('Error retrieving support data:', error);
    return NextResponse.json(
      { message: 'An error occurred while retrieving support data' },
      { status: 500 }
    );
  }
} 