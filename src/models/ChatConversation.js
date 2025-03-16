// src/models/ChatConversation.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChatConversationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null // Allow null for anonymous users
  },
  sessionId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    referrer: String,
    path: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    feedback: {
      type: String,
      default: null
    },
    ratedAt: {
      type: Date,
      default: null
    }
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Add index for better performance
ChatConversationSchema.index({ userId: 1, sessionId: 1 });
ChatConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.models.ChatConversation || 
  mongoose.model('ChatConversation', ChatConversationSchema);