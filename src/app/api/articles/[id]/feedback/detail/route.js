// src/app/api/articles/[id]/feedback/detail/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    await connectToDatabase();
    
    // Store detailed feedback
    // You might want to create a separate model for detailed feedback
    // For now, we'll just log it
    console.log(`Detailed feedback for article ${id}:`, data.feedbackText);
    
    return NextResponse.json({
      success: true,
      message: 'Detailed feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting detailed feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error submitting detailed feedback'
      },
      { status: 500 }
    );
  }
}