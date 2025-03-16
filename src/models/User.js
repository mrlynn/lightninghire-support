import mongoose from 'mongoose';
import { Schema, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // Adding username field with default to email
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  image: { type: String },
  auth_provider: { type: String, default: 'credentials' },
  stripeCustomerId: { type: String, sparse: true },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  role: { 
    type: String, 
    enum: ['user', 'support_agent', 'admin'], 
    default: 'user' 
  },
  supportPreferences: {
    emailNotifications: { type: Boolean, default: true },
    notificationFrequency: { 
      type: String, 
      enum: ['immediate', 'daily', 'weekly', 'never'],
      default: 'immediate'
    }
  },
  lastSupportActivity: { type: Date },
  supportStats: {
    articlesRead: { type: Number, default: 0 },
    feedbackGiven: { type: Number, default: 0 },
    ticketsCreated: { type: Number, default: 0 }
  },
  // Enhanced support activity tracking
  supportActivity: {
    searchHistory: [{ 
      query: String, 
      timestamp: { type: Date, default: Date.now },
      resultsCount: Number
    }],
    articleViews: [{ 
      articleId: { type: Schema.Types.ObjectId, ref: 'Article' }, 
      title: String,
      timestamp: { type: Date, default: Date.now },
      timeSpent: Number, // in seconds
      helpful: Boolean // whether user marked article as helpful
    }],
    supportTickets: [{ 
      ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' }, 
      title: String,
      status: String,
      timestamp: { type: Date, default: Date.now },
      resolved: Boolean,
      satisfactionRating: Number // 1-5 scale
    }]
  },
  // Knowledge profile - topics the user has shown interest in
  knowledgeProfile: {
    interests: [String], // tags/categories user has engaged with
    expertise: [{
      topic: String,
      level: { type: Number, min: 0, max: 5, default: 0 } // 0=none, 5=expert
    }],
    recommendedContent: [{ type: Schema.Types.ObjectId, ref: 'Article' }]
  },
  // Interaction history with main Lightning Hire system 
  mainAppActivity: {
    lastLogin: Date,
    productUsage: {
      resumesEvaluated: { type: Number, default: 0 },
      featuresUsed: [String],
      lastFeatureUsed: String
    }
  },
  isAdmin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
