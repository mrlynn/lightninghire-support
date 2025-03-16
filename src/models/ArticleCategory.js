// src/models/ArticleCategory.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ArticleCategorySchema = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this category'],
    maxlength: [50, 'Name cannot be more than 50 characters'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'ArticleCategory',
    default: null
  },
  order: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Add virtual for getting child categories
ArticleCategorySchema.virtual('children', {
  ref: 'ArticleCategory',
  localField: '_id',
  foreignField: 'parent',
  options: { sort: { order: 1 } }
});

// Create a slug from the name
ArticleCategorySchema.pre('validate', function(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

export default mongoose.models.ArticleCategory || 
  mongoose.model('ArticleCategory', ArticleCategorySchema);