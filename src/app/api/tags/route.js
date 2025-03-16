// src/app/api/tags/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Get all articles
    const articles = await KnowledgeArticle.find()
      .select('tags')
      .lean();
    
    // Extract unique tags
    const allTags = [...new Set(articles.flatMap(article => article.tags || []))];
    
    return NextResponse.json({
      success: true,
      tags: allTags
    });
  } catch (error) {
    console.error('Error getting tags:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving tags'
      },
      { status: 500 }
    );
  }
}