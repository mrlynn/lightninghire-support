import Ticket from '@/models/Ticket';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongoose';

/**
 * Create a new support ticket
 */
export async function createTicket(ticketData) {
  await connectToDatabase();
  
  try {
    const ticket = await Ticket.create(ticketData);
    return ticket;
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw error;
  }
}

/**
 * Get ticket by ID
 */
export async function getTicketById(ticketId) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new Error('Invalid ticket ID');
    }
    
    const ticket = await Ticket.findById(ticketId)
      .populate('requestor', 'name email')
      .populate('assignee', 'name email')
      .populate('comments.createdBy', 'name email');
      
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
}

/**
 * Update a ticket
 */
export async function updateTicket(ticketId, updateData) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new Error('Invalid ticket ID');
    }
    
    // Use { new: true } to return the updated document
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
}

/**
 * Delete a ticket
 */
export async function deleteTicket(ticketId) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new Error('Invalid ticket ID');
    }
    
    const ticket = await Ticket.findByIdAndDelete(ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting ticket:', error);
    throw error;
  }
}

/**
 * Add a comment to a ticket
 */
export async function addTicketComment(ticketId, commentData) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new Error('Invalid ticket ID');
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { comments: commentData } },
      { new: true, runValidators: true }
    ).populate('comments.createdBy', 'name email');
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

/**
 * Get tickets with filtering, pagination and sorting
 */
export async function getTickets(query = {}) {
  await connectToDatabase();
  
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      assignee,
      requestor,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;
    
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignee) filter.assignee = assignee;
    if (requestor) filter.requestor = requestor;
    
    // Text search
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const tickets = await Ticket.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('requestor', 'name email')
      .populate('assignee', 'name email');
    
    // Get total count
    const totalCount = await Ticket.countDocuments(filter);
    
    return {
      tickets,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    };
  } catch (error) {
    console.error('Error fetching tickets:', error);
    throw error;
  }
}

/**
 * Get ticket stats
 */
export async function getTicketStats() {
  await connectToDatabase();
  
  try {
    const statusCounts = await Ticket.aggregate([
      { 
        $group: { 
          _id: '$status', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const priorityCounts = await Ticket.aggregate([
      { 
        $group: { 
          _id: '$priority', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    const categoryCounts = await Ticket.aggregate([
      { 
        $group: { 
          _id: '$category', 
          count: { $sum: 1 } 
        } 
      }
    ]);
    
    // Format the results
    const formatCounts = (data) => {
      return data.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
    };
    
    return {
      statusCounts: formatCounts(statusCounts),
      priorityCounts: formatCounts(priorityCounts),
      categoryCounts: formatCounts(categoryCounts)
    };
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    throw error;
  }
}

/**
 * Add an attachment to a ticket
 */
export async function addTicketAttachment(ticketId, attachmentData) {
  await connectToDatabase();
  
  try {
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      throw new Error('Invalid ticket ID');
    }
    
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { $push: { attachments: attachmentData } },
      { new: true, runValidators: true }
    );
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  } catch (error) {
    console.error('Error adding attachment:', error);
    throw error;
  }
} 