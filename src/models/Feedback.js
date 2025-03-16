import mongoose from 'mongoose';

// Define Feedback schema
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

// Create compound index to prevent duplicate feedback
feedbackSchema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });

// Add static methods
feedbackSchema.statics.getAverageRating = async function(itemId, itemType) {
  const result = await this.aggregate([
    { $match: { itemId, itemType } },
    { 
      $group: { 
        _id: null, 
        averageRating: { $avg: '$rating' },
        helpfulCount: { $sum: { $cond: [{ $eq: ['$helpful', true] }, 1, 0] } },
        totalCount: { $sum: 1 }
      } 
    }
  ]);
  
  if (result.length > 0) {
    return {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      helpfulCount: result[0].helpfulCount,
      totalCount: result[0].totalCount,
      helpfulPercentage: parseFloat(((result[0].helpfulCount / result[0].totalCount) * 100).toFixed(1))
    };
  }
  
  return {
    averageRating: 0,
    helpfulCount: 0,
    totalCount: 0,
    helpfulPercentage: 0
  };
};

// Method to get feedback distribution by rating
feedbackSchema.statics.getRatingDistribution = async function(itemId, itemType) {
  const result = await this.aggregate([
    { $match: { itemId, itemType } },
    { 
      $group: { 
        _id: '$rating', 
        count: { $sum: 1 }
      } 
    },
    { $sort: { _id: 1 } }
  ]);
  
  // Create a distribution map for all ratings 1-5
  const distribution = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
  
  // Fill in the actual counts
  result.forEach(rating => {
    distribution[rating._id] = rating.count;
  });
  
  return distribution;
};

// Ensure model isn't redefined if already defined in mongoose.models
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 