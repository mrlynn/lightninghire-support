// src/app/api/articles/[id]/feedback/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Update helpfulness counts based on feedback
    if (data.isHelpful) {
      article.helpfulCount = (article.helpfulCount || 0) + 1;
    } else {
      article.unhelpfulCount = (article.unhelpfulCount || 0) + 1;
    }
    
    await article.save();
    
    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error submitting feedback'
      },
      { status: 500 }
    );
  }
}