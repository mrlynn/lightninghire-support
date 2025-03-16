// src/app/api/articles/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    let article;
    
    // Check if id is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      article = await KnowledgeArticle.findById(id)
        .populate('category', 'name slug')
        .select('-embedding') // Don't return embedding vectors
        .lean();
    } else {
      // Assume it's a slug
      article = await KnowledgeArticle.findOne({ slug: id })
        .populate('category', 'name slug')
        .select('-embedding') // Don't return embedding vectors
        .lean();
    }
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Convert MongoDB ObjectIds to strings for JSON serialization
    const serializedArticle = {
      ...article,
      _id: article._id.toString(),
      category: article.category ? {
        ...article.category,
        _id: article.category._id.toString()
      } : null
    };
    
    return NextResponse.json({
      success: true,
      article: serializedArticle
    });
  } catch (error) {
    console.error('Error getting article:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving article'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    // In a real app, check authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }
    
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Validation
    if (!data.title || !data.slug || !data.content || !data.shortDescription || !data.category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists for another article
    const existingArticle = await KnowledgeArticle.findOne({ 
      slug: data.slug,
      _id: { $ne: id }
    });
    
    if (existingArticle) {
      return NextResponse.json(
        { success: false, message: 'An article with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Set published date if article is being published for the first time
    if (data.status === 'published' && article.status !== 'published') {
      data.publishedDate = new Date();
    }
    
    // Update the article
    Object.assign(article, data);
    article.lastUpdated = new Date();
    await article.save();
    
    // Generate or update embedding if article is published
    if (article.status === 'published' && process.env.ENABLE_VECTOR_SEARCH === 'true') {
      try {
        const { OpenAIEmbeddings } = await import('@/lib/openai');
        const content = `${article.title}\n${article.shortDescription}\n${article.content}`;
        const embedding = await OpenAIEmbeddings.createEmbedding(content);
        
        article.embedding = embedding;
        await article.save();
      } catch (error) {
        console.error('Error generating embedding:', error);
        // Continue without embeddings
      }
    }
    
    return NextResponse.json({
      success: true,
      article: {
        ...article.toObject(),
        _id: article._id.toString(),
        embedding: undefined // Don't return embedding vectors
      }
    });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error updating article'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    // In a real app, check authentication
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }
    
    await connectToDatabase();
    
    const article = await KnowledgeArticle.findById(id);
    
    if (!article) {
      return NextResponse.json(
        { success: false, message: 'Article not found' },
        { status: 404 }
      );
    }
    
    // Delete the article
    await article.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error deleting article'
      },
      { status: 500 }
    );
  }
}