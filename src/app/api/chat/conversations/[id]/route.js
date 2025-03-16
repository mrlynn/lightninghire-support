// src/app/api/chat/conversations/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import ChatConversation from '@/models/ChatConversation';
import ChatMessage from '@/models/ChatMessage';

export async function GET(req, { params }) {
  try {
    // Await params before accessing properties
    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;
    
    await connectToDatabase();
    
    // Get the conversation
    const conversation = await ChatConversation.findById(id);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // For now, we'll skip authentication checks
    // In a real environment, you would verify ownership here
    
    // Get the messages
    const messages = await ChatMessage.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .lean();
    
    // Format the messages for the client
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      sources: msg.sources || [],
      timestamp: msg.createdAt,
      id: msg._id
    }));
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation._id,
        title: conversation.title,
        status: conversation.status,
        createdAt: conversation.createdAt,
        lastMessageAt: conversation.lastMessageAt,
      },
      messages: formattedMessages
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving conversation'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // Await params before accessing properties
    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;
    const data = await req.json();
    
    await connectToDatabase();
    
    // Get the conversation
    const conversation = await ChatConversation.findById(id);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // For now, we'll skip authentication checks
    // In a real environment, you would verify ownership here
    
    // Update fields that are allowed to be updated
    const allowedUpdates = ['title', 'status'];
    const updates = {};
    
    for (const field of allowedUpdates) {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    }
    
    // Update the conversation
    const updatedConversation = await ChatConversation.findByIdAndUpdate(
      id,
      updates,
      { new: true }
    );
    
    return NextResponse.json({
      success: true,
      conversation: {
        id: updatedConversation._id,
        title: updatedConversation.title,
        status: updatedConversation.status,
        createdAt: updatedConversation.createdAt,
        lastMessageAt: updatedConversation.lastMessageAt,
      }
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error updating conversation'
      },
      { status: 500 }
    );
  }
}
// src/app/api/chat/conversations/[id]/route.js
// Add the DELETE method to your existing route file

export async function DELETE(req, { params }) {
  try {
    // Await params before accessing properties
    const paramsObj = await Promise.resolve(params);
    const id = paramsObj.id;
    
    await connectToDatabase();
    
    // Get the conversation
    const conversation = await ChatConversation.findById(id);
    
    if (!conversation) {
      return NextResponse.json(
        { success: false, message: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // For now, we'll skip authentication checks
    // In a real environment, you would verify admin roles here
    
    // Delete all messages in this conversation
    await ChatMessage.deleteMany({ conversationId: id });
    
    // Delete the conversation
    await conversation.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Conversation and all messages deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error deleting conversation'
      },
      { status: 500 }
    );
  }
}