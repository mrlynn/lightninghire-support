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
  permissions: [String],
  organization: { type: String },
  preferredLanguage: { type: String, default: 'en' },
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
    articlesViewed: { type: Number, default: 0 },
    searchesPerformed: { type: Number, default: 0 },
    ticketsCreated: { type: Number, default: 0 },
    ticketsResolved: { type: Number, default: 0 },
    feedbackGiven: { type: Number, default: 0 }
  },
  // Enhanced support activity tracking
  supportActivity: {
    searches: [{ 
      query: String, 
      timestamp: { type: Date, default: Date.now },
      resultsCount: Number
    }],
    articleViews: [{ 
      articleId: { type: Schema.Types.ObjectId, ref: 'Article' }, 
      title: String,
      viewCount: { type: Number, default: 1 },
      firstViewed: { type: Date, default: Date.now },
      lastViewed: { type: Date, default: Date.now },
      totalTimeSpent: { type: Number, default: 0 }, // in seconds
      helpful: Boolean // whether user marked article as helpful
    }],
    tickets: [{ 
      ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket' }, 
      title: String,
      status: String,
      createdAt: { type: Date, default: Date.now },
      resolvedAt: Date,
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
  // Interaction history with main LightningHire system 
  mainAppActivity: {
    lastLogin: Date,
    productUsage: {
      resumesEvaluated: { type: Number, default: 0 },
      featuresUsed: [String],
      lastFeatureUsed: String
    }
  },
  refreshToken: { type: String },
  isAdmin: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
  last_login: { type: Date, default: Date.now }
}, { timestamps: true });

// Create indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ auth_provider: 1 });
UserSchema.index({ 'supportActivity.articleViews.articleId': 1 });
UserSchema.index({ 'supportActivity.tickets.ticketId': 1 });

// Add a static method to find user by provider ID
UserSchema.statics.findByProvider = async function(provider, providerId) {
  const query = { [`${provider}Id`]: providerId };
  return this.findOne(query);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
