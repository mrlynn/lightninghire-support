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

export async function GET(request, { params }) {
  try {
    // In Next.js App Router, params might need to be awaited in some contexts
    // Make sure we have the params object before accessing its properties
    const paramsObj = await Promise.resolve(params);
    const userId = paramsObj.id;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }
    
    // Only allow users to access their own profile or admins to access any profile
    const isAdmin = session.user.role === 'admin' || session.user.role === 'support_agent';
    const isOwnProfile = session.user.id === userId;
    
    if (!isAdmin && !isOwnProfile) {
      return NextResponse.json(
        { message: 'Forbidden. You can only access your own profile.' },
        { status: 403 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If we couldn't import User model, try to get it from the mongoose models
    const mongoose = await import('mongoose');
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user and include all activity data
    const user = await User.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create a sanitized user object (remove sensitive data)
    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      role: user.role || (user.isAdmin ? 'admin' : 'user'),
      auth_provider: user.auth_provider,
      subscriptionPlan: user.subscriptionPlan,
      supportPreferences: user.supportPreferences,
      supportStats: user.supportStats || {
        articlesRead: 0,
        feedbackGiven: 0,
        ticketsCreated: 0
      },
      lastSupportActivity: user.lastSupportActivity,
      created_at: user.created_at,
      last_login: user.last_login,
    };
    
    // Include detailed activity data if requested by admin or self
    if (request.nextUrl.searchParams.get('includeActivity') === 'true') {
      userProfile.supportActivity = user.supportActivity || {
        searchHistory: [],
        articleViews: [],
        supportTickets: []
      };
      
      userProfile.knowledgeProfile = user.knowledgeProfile || {
        interests: [],
        expertise: [],
        recommendedContent: []
      };
      
      // Include info from main app if available
      if (user.mainAppActivity) {
        userProfile.mainAppActivity = user.mainAppActivity;
      }
      
      // Limit the size of arrays to prevent overly large responses
      const MAX_ITEMS = 50;
      
      if (userProfile.supportActivity?.searchHistory?.length > MAX_ITEMS) {
        userProfile.supportActivity.searchHistory = 
          userProfile.supportActivity.searchHistory.slice(-MAX_ITEMS);
      }
      
      if (userProfile.supportActivity?.articleViews?.length > MAX_ITEMS) {
        userProfile.supportActivity.articleViews = 
          userProfile.supportActivity.articleViews.slice(-MAX_ITEMS);
      }
      
      if (userProfile.supportActivity?.supportTickets?.length > MAX_ITEMS) {
        userProfile.supportActivity.supportTickets = 
          userProfile.supportActivity.supportTickets.slice(-MAX_ITEMS);
      }
    }
    
    // Generate recommendations based on user interests and expertise
    if (user.knowledgeProfile?.interests?.length > 0) {
      // Here you would add code to generate recommendations based on user interests
      // This is a placeholder for the recommendation logic
      userProfile.recommendations = {
        suggestedArticles: [],
        relatedTopics: user.knowledgeProfile.interests.slice(0, 5)
      };
    }
    
    return NextResponse.json(userProfile);
    
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching user profile' },
      { status: 500 }
    );
  }
} 