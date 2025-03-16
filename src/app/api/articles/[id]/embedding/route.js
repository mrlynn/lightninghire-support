// src/app/api/articles/[id]/embedding/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { OpenAIEmbeddings } from '@/lib/openai';

export async function POST(req, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Create content for embedding
    const content = `${article.title}\n${article.shortDescription}\n${article.content}`;
    
    // Generate embedding
    const embedding = await OpenAIEmbeddings.createEmbedding(content);
    
    // Save embedding
    article.embedding = embedding;
    await article.save();
    
    return NextResponse.json({
      success: true,
      message: 'Embedding generated successfully'
    });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error generating embedding'
      },
      { status: 500 }
    );
  }
}