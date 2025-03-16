// src/models/KnowledgeArticle.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const KnowledgeArticleSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title for this article'],
    maxlength: [100, 'Title cannot be more than 100 characters'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  content: {
    type: String,
    required: [true, 'Please provide content for this article']
  },
  shortDescription: {
    type: String,
    required: [true, 'Please provide a short description'],
    maxlength: [250, 'Short description cannot be more than 250 characters']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'ArticleCategory',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // Make it not required to solve the issue
    required: false
  },
  publishedDate: {
    type: Date,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  unhelpfulCount: {
    type: Number,
    default: 0
  },
  relatedArticles: [{
    type: Schema.Types.ObjectId,
    ref: 'KnowledgeArticle'
  }],
  embedding: {
    type: [Number],
    default: null,
    index: false // We'll create a vector index separately
  }
}, { timestamps: true });

// Create fulltext search index
KnowledgeArticleSchema.index({ 
  title: 'text', 
  content: 'text', 
  shortDescription: 'text', 
  tags: 'text' 
});

// Create a slug from the title
KnowledgeArticleSchema.pre('validate', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export default mongoose.models.KnowledgeArticle || 
  mongoose.model('KnowledgeArticle', KnowledgeArticleSchema);