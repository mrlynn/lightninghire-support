// src/models/ChatMessage.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChatMessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sources: [{
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeArticle'
    },
    title: String,
    score: Number
  }],
  metadata: {
    tokensUsed: Number,
    processingTime: Number,
    promptTokens: Number,
    completionTokens: Number
  }
}, { timestamps: true });

// Add index for better performance
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.models.ChatMessage || 
  mongoose.model('ChatMessage', ChatMessageSchema);