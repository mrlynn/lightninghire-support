import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import mongoose from 'mongoose';

// Import User model
let User;
try {
  User = require('@/models/User').default;
} catch (error) {
  console.warn('User model not found in current app, will try to use User from shared database');
}

/**
 * GET /api/users/stats
 * Retrieves activity statistics for the authenticated user
 */
export async function GET(request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If we couldn't import User model, try to get it from the mongoose models
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user
    const userId = session.user.id;
    const user = await User.findById(userId).select('supportStats supportActivity lastSupportActivity');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Calculate activity metrics
    const activitySummary = {
      // Basic statistics
      stats: user.supportStats || {
        articlesViewed: 0,
        searchesPerformed: 0,
        ticketsCreated: 0,
        ticketsResolved: 0,
        feedbackGiven: 0
      },
      
      // Recent activities
      recentActivity: {
        articles: [],
        searches: [],
        tickets: []
      },
      
      // Last active time
      lastActive: user.lastSupportActivity || null
    };
    
    // Get recent article views (last 5)
    if (user.supportActivity?.articleViews?.length) {
      activitySummary.recentActivity.articles = user.supportActivity.articleViews
        .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
        .slice(0, 5)
        .map(article => ({
          id: article.articleId,
          title: article.title,
          viewCount: article.viewCount,
          lastViewed: article.lastViewed,
          helpful: article.helpful
        }));
    }
    
    // Get recent searches (last 5)
    if (user.supportActivity?.searches?.length) {
      activitySummary.recentActivity.searches = user.supportActivity.searches
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5)
        .map(search => ({
          query: search.query,
          resultsCount: search.resultsCount,
          timestamp: search.timestamp
        }));
    }
    
    // Get recent tickets (last 5)
    if (user.supportActivity?.tickets?.length) {
      activitySummary.recentActivity.tickets = user.supportActivity.tickets
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(ticket => ({
          id: ticket.ticketId,
          title: ticket.title,
          status: ticket.status,
          createdAt: ticket.createdAt,
          resolvedAt: ticket.resolvedAt
        }));
    }
    
    return NextResponse.json(activitySummary);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user statistics' },
      { status: 500 }
    );
  }
} 