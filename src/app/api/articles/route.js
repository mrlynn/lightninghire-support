// src/app/api/articles/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    
    // In a real app, check authentication
    // if (!session) {
    //   return NextResponse.json(
    //     { success: false, message: 'Not authenticated' },
    //     { status: 401 }
    //   );
    // }
    
    const data = await req.json();
    
    await connectToDatabase();
    
    // Basic validation
    if (!data.title || !data.slug || !data.content || !data.shortDescription || !data.category) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if slug already exists
    const existingArticle = await KnowledgeArticle.findOne({ slug: data.slug });
    if (existingArticle) {
      return NextResponse.json(
        { success: false, message: 'An article with this slug already exists' },
        { status: 400 }
      );
    }
    
    // Set the author (using placeholder ID for now)
    data.author = data.author || new mongoose.Types.ObjectId('000000000000000000000000');
    
    // Set published date if article is being published
    if (data.status === 'published') {
      data.publishedDate = new Date();
    }
    
    // Create the article
    const article = new KnowledgeArticle(data);
    await article.save();
    
    // Generate embedding if article is published
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
    console.error('Error creating article:', error);
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Error creating article'
      },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    
    // Parse pagination params
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const status = url.searchParams.get('status') || 'published';
    
    await connectToDatabase();
    
    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } }
      ];
    }
    
    // When for public use, only show published articles
    // For admin use, filter by status if provided
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    // Get articles with pagination
    const articles = await KnowledgeArticle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .select('-embedding') // Don't return embedding vectors
      .lean();
    
    // Get total count for pagination
    const total = await KnowledgeArticle.countDocuments(query);
    
    // Convert MongoDB ObjectIds to strings for JSON serialization
    const serializedArticles = articles.map(article => ({
      ...article,
      _id: article._id.toString(),
      category: article.category ? {
        ...article.category,
        _id: article.category._id.toString()
      } : null
    }));
    
    return NextResponse.json({
      success: true,
      articles: serializedArticles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving articles'
      },
      { status: 500 }
    );
  }
}