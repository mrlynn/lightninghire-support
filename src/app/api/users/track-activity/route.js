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
 * POST /api/users/track-activity
 * Tracks various user activities in the support portal
 */
export async function POST(request) {
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
    
    // Get activity data from request body
    const { type, data } = await request.json();
    
    if (!type || !data) {
      return NextResponse.json(
        { error: 'Activity type and data are required' },
        { status: 400 }
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
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Initialize support stats if not already present
    if (!user.supportStats) {
      user.supportStats = {
        articlesViewed: 0,
        searchesPerformed: 0,
        ticketsCreated: 0,
        ticketsResolved: 0,
        feedbackGiven: 0
      };
    }
    
    // Initialize support activity if not already present
    if (!user.supportActivity) {
      user.supportActivity = {
        articleViews: [],
        searches: [],
        tickets: []
      };
    }
    
    // Prepare update operations based on activity type
    const updateOperations = {
      lastSupportActivity: new Date()
    };
    
    // Handle different activity types
    switch (type) {
      case 'articleView': {
        const { articleId, title, timeSpent, helpful } = data;
        
        if (!articleId) {
          return NextResponse.json(
            { error: 'Article ID is required for article view tracking' },
            { status: 400 }
          );
        }
        
        // Check if this article has been viewed before
        const existingView = user.supportActivity.articleViews.find(
          view => view.articleId.toString() === articleId.toString()
        );
        
        if (existingView) {
          // Update existing view
          existingView.viewCount += 1;
          existingView.lastViewed = new Date();
          existingView.totalTimeSpent = (existingView.totalTimeSpent || 0) + (timeSpent || 0);
          
          // Only update helpful status if it was provided
          if (helpful !== null && helpful !== undefined) {
            existingView.helpful = helpful;
          }
        } else {
          // Add new article view
          user.supportActivity.articleViews.push({
            articleId,
            title: title || 'Unknown Article',
            viewCount: 1,
            firstViewed: new Date(),
            lastViewed: new Date(),
            totalTimeSpent: timeSpent || 0,
            helpful
          });
          
          // Increment articles viewed count
          user.supportStats.articlesViewed = (user.supportStats.articlesViewed || 0) + 1;
        }
        break;
      }
      
      case 'search': {
        const { query, resultsCount } = data;
        
        if (!query) {
          return NextResponse.json(
            { error: 'Search query is required for search tracking' },
            { status: 400 }
          );
        }
        
        // Add search to history
        user.supportActivity.searches.push({
          query,
          resultsCount: resultsCount || 0,
          timestamp: new Date()
        });
        
        // Maintain reasonable size of search history (keep last 50)
        if (user.supportActivity.searches.length > 50) {
          user.supportActivity.searches = user.supportActivity.searches.slice(-50);
        }
        
        // Increment searches performed count
        user.supportStats.searchesPerformed = (user.supportStats.searchesPerformed || 0) + 1;
        break;
      }
      
      case 'ticketCreation': {
        const { ticketId, title } = data;
        
        if (!ticketId) {
          return NextResponse.json(
            { error: 'Ticket ID is required for ticket creation tracking' },
            { status: 400 }
          );
        }
        
        // Add ticket to history
        user.supportActivity.tickets.push({
          ticketId,
          title: title || 'Unknown Ticket',
          createdAt: new Date(),
          status: 'open'
        });
        
        // Increment tickets created count
        user.supportStats.ticketsCreated = (user.supportStats.ticketsCreated || 0) + 1;
        break;
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported activity type: ${type}` },
          { status: 400 }
        );
    }
    
    // Save user with updated activity
    await user.save();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return NextResponse.json(
      { error: 'An error occurred while tracking user activity' },
      { status: 500 }
    );
  }
} 