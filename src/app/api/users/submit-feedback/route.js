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

// Import Feedback model if you have one
let Feedback;
try {
  Feedback = require('@/models/Feedback').default;
} catch (error) {
  // We'll handle this in the POST function below
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
    
    // Get feedback data from request body
    const { itemId, itemType, rating, comments } = await request.json();
    
    if (!itemId || !itemType || rating === undefined) {
      return NextResponse.json(
        { message: 'Item ID, type, and rating are required' },
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
    
    // Create Feedback model if it doesn't exist
    if (!Feedback) {
      const FeedbackSchema = new mongoose.Schema({
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        itemId: { type: String, required: true },
        itemType: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comments: { type: String },
        createdAt: { type: Date, default: Date.now }
      });
      
      Feedback = mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
    }
    
    // Create new feedback entry
    const newFeedback = new Feedback({
      userId: user._id,
      itemId,
      itemType,
      rating,
      comments,
      createdAt: new Date()
    });
    
    await newFeedback.save();
    
    // Update user's feedback count
    if (!user.supportStats) {
      user.supportStats = { feedbackGiven: 0 };
    }
    
    user.supportStats.feedbackGiven = (user.supportStats.feedbackGiven || 0) + 1;
    user.lastSupportActivity = new Date();
    
    // If this is article feedback, update the article view record
    if (itemType === 'article' && user.supportActivity?.articleViews) {
      const articleView = user.supportActivity.articleViews.find(
        view => view.articleId.toString() === itemId
      );
      
      if (articleView) {
        articleView.helpful = rating >= 4; // Consider ratings of 4 or 5 as helpful
      }
    }
    
    await user.save();
    
    return NextResponse.json({
      message: 'Feedback submitted successfully',
      feedbackId: newFeedback._id
    });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { message: 'An error occurred while submitting feedback' },
      { status: 500 }
    );
  }
} 