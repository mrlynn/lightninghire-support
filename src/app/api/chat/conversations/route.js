// src/app/api/chat/conversations/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import ChatConversation from '@/models/ChatConversation';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    
    // Parse pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';
    const dateFrom = url.searchParams.get('dateFrom') || '';
    const dateTo = url.searchParams.get('dateTo') || '';
    
    await connectToDatabase();
    
    // Build query
    const query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Date filtering
    if (dateFrom || dateTo) {
      query.createdAt = {};
      
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // Add one day to include the end date fully
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query.createdAt.$lte = endDate;
      }
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get conversations with pagination
    const conversations = await ChatConversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Get total count for pagination
    const total = await ChatConversation.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error retrieving conversations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving conversations'
      },
      { status: 500 }
    );
  }
}