import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_for_customer', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    requestor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requestor is required']
    },
    // Store contact information separately for quick access and historical purposes
    contactInfo: {
      name: String,
      email: {
        type: String,
        required: [true, 'Contact email is required']
      },
      role: String,
      auth_provider: String
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    comments: [
      {
        content: {
          type: String,
          required: [true, 'Comment content is required']
        },
        createdBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: [true, 'Comment creator is required']
        },
        authorInfo: {
          name: String,
          email: String,
          role: String
        },
        isInternal: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    attachments: [
      {
        fileName: String,
        fileSize: Number,
        fileType: String,
        fileUrl: String,
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        uploaderInfo: {
          name: String,
          email: String
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    tags: [String],
    dueDate: {
      type: Date,
      default: null
    },
    resolutionSummary: {
      type: String,
      default: ''
    },
    // Track creation source for analytics
    creationSource: {
      type: String,
      enum: ['web', 'email', 'api', 'admin'],
      default: 'web'
    },
    // Store session ID for tracking purposes
    sessionData: {
      browser: String,
      os: String,
      device: String
    }
  },
  {
    timestamps: true,
  }
);

// Add text search index
ticketSchema.index(
  { 
    title: 'text', 
    description: 'text',
    'comments.content': 'text'
  }
);

export default mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema); 