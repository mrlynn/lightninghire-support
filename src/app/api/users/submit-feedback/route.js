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

// Import Feedback model
let Feedback;
try {
  Feedback = require('@/models/Feedback').default;
} catch (error) {
  console.warn('Feedback model not found, will create schema dynamically');
}

/**
 * POST /api/users/submit-feedback
 * Handles user feedback submissions for various items in the support portal
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
    
    // Get feedback data from request body
    const { itemId, itemType, rating, comments } = await request.json();
    
    if (!itemId || !itemType || rating === undefined) {
      return NextResponse.json(
        { error: 'Item ID, type, and rating are required' },
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
    
    // Create Feedback model if it doesn't exist
    if (!Feedback) {
      const feedbackSchema = new mongoose.Schema(
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required']
          },
          itemId: {
            type: String,
            required: [true, 'Item ID is required']
          },
          itemType: {
            type: String,
            enum: ['article', 'ticket', 'feature', 'support'],
            required: [true, 'Item type is required']
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
            required: [true, 'Rating is required']
          },
          comments: {
            type: String,
            default: ''
          },
          helpful: {
            type: Boolean,
            default: null
          }
        },
        {
          timestamps: true
        }
      );
      
      // Create compound index for preventing duplicate feedback
      feedbackSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
      
      Feedback = mongoose.model('Feedback', feedbackSchema);
    }
    
    // Create or update feedback
    const feedbackData = {
      userId: userId,
      itemId,
      itemType,
      rating,
      comments: comments || '',
      helpful: rating >= 4 // Consider ratings 4-5 as helpful
    };
    
    // Use findOneAndUpdate with upsert to create or update feedback
    await Feedback.findOneAndUpdate(
      { userId, itemId, itemType },
      feedbackData,
      { upsert: true, new: true }
    );
    
    // Update user's feedback count
    await User.findByIdAndUpdate(
      userId,
      {
        lastSupportActivity: new Date(),
        $inc: { 'supportStats.feedbackGiven': 1 }
      }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Handle duplicate key error separately
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'You have already provided feedback for this item' },
        { status: 409 }
      );
    }
    
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting feedback' },
      { status: 500 }
    );
  }
} 