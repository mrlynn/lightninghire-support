import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
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

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback; 