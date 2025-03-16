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
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }
    
    // Get activity data from request body
    const { type, data } = await request.json();
    
    if (!type || !data) {
      return NextResponse.json(
        { message: 'Activity type and data are required' },
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
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Initialize supportActivity if it doesn't exist
    if (!user.supportActivity) {
      user.supportActivity = {
        searchHistory: [],
        articleViews: [],
        supportTickets: []
      };
    }
    
    // Update user activity based on type
    switch (type) {
      case 'articleView':
        // Add article view
        user.supportActivity.articleViews.push({
          articleId: data.articleId,
          title: data.title,
          timestamp: new Date(),
          timeSpent: data.timeSpent || 0,
          helpful: data.helpful
        });
        
        // Update knowledge profile with interests based on article tags
        if (data.tags && Array.isArray(data.tags)) {
          if (!user.knowledgeProfile) {
            user.knowledgeProfile = { interests: [] };
          }
          
          // Add unique tags to interests
          data.tags.forEach(tag => {
            if (!user.knowledgeProfile.interests.includes(tag)) {
              user.knowledgeProfile.interests.push(tag);
            }
          });
        }
        
        // Increment articles read count
        if (!user.supportStats) {
          user.supportStats = { articlesRead: 0 };
        }
        user.supportStats.articlesRead = (user.supportStats.articlesRead || 0) + 1;
        break;
        
      case 'search':
        // Add search to history
        user.supportActivity.searchHistory.push({
          query: data.query,
          timestamp: new Date(),
          resultsCount: data.resultsCount || 0
        });
        break;
        
      case 'ticketCreation':
        // Add ticket to history
        user.supportActivity.supportTickets.push({
          ticketId: data.ticketId,
          title: data.title,
          status: 'open',
          timestamp: new Date(),
          resolved: false
        });
        
        // Increment tickets created count
        if (!user.supportStats) {
          user.supportStats = { ticketsCreated: 0 };
        }
        user.supportStats.ticketsCreated = (user.supportStats.ticketsCreated || 0) + 1;
        break;
        
      default:
        return NextResponse.json(
          { message: 'Invalid activity type' },
          { status: 400 }
        );
    }
    
    // Update last support activity timestamp
    user.lastSupportActivity = new Date();
    
    // Save user
    await user.save();
    
    return NextResponse.json({
      message: 'Activity tracked successfully'
    });
    
  } catch (error) {
    console.error('Error tracking user activity:', error);
    return NextResponse.json(
      { message: 'An error occurred while tracking activity' },
      { status: 500 }
    );
  }
} 