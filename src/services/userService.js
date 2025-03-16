import { connectToDatabase } from '@/lib/mongoose';
import mongoose from 'mongoose';

// Get User model
let User;
try {
  User = require('@/models/User').default;
} catch (error) {
  console.warn('User model not found in current app, will try to use User from shared database');
}

/**
 * Update user support statistics
 */
export async function updateUserSupportStats(userId, updates = {}) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // If we couldn't import User model, try to get it from the mongoose models
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Prepare update object
    const updateObj = {};
    
    // Update last support activity time
    updateObj.lastSupportActivity = new Date();
    
    // Increment counters based on activity
    if (updates.articleRead) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc['supportStats.articlesRead'] = 1;
    }
    
    if (updates.feedbackGiven) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc['supportStats.feedbackGiven'] = 1;
    }
    
    if (updates.ticketCreated) {
      updateObj.$inc = updateObj.$inc || {};
      updateObj.$inc['supportStats.ticketsCreated'] = 1;
      
      // Add ticket to support activity if ticketId is provided
      if (updates.ticketId && updates.ticketTitle) {
        updateObj.$push = {
          'supportActivity.supportTickets': {
            ticketId: updates.ticketId,
            title: updates.ticketTitle,
            status: 'open',
            timestamp: new Date(),
            resolved: false
          }
        };
      }
    }
    
    // Update user document
    await User.findByIdAndUpdate(
      userId,
      updateObj,
      { new: true }
    );
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user support stats:', error);
    throw error;
  }
}

/**
 * Get user profile with support statistics
 */
export async function getUserProfile(userId) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }
    
    // If we couldn't import User model, try to get it from the mongoose models
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user with minimal fields for security
    const user = await User.findById(userId).select(
      'name email image role supportStats supportPreferences lastSupportActivity'
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
} 