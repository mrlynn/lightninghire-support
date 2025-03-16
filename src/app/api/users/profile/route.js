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
 * GET /api/users/profile
 * Fetches the user profile for the authenticated user
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
    const user = await User.findById(userId).select('-password -refreshToken -__v');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // If the user doesn't have a supportStats object, initialize it
    if (!user.supportStats) {
      user.supportStats = {
        articlesViewed: 0,
        searchesPerformed: 0,
        ticketsCreated: 0,
        ticketsResolved: 0,
        feedbackGiven: 0
      };
    }
    
    // Return user profile with extra properties from the session
    return NextResponse.json({
      id: user._id,
      name: session.user.name || user.name,
      email: session.user.email || user.email,
      image: session.user.image || user.image,
      role: user.role || 'user',
      permissions: user.permissions || [],
      organization: user.organization,
      supportStats: user.supportStats,
      lastSupportActivity: user.lastSupportActivity,
      preferredLanguage: user.preferredLanguage || 'en',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching user profile' },
      { status: 500 }
    );
  }
} 