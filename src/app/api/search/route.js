// src/app/api/search/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import KnowledgeArticle from '@/models/KnowledgeArticle';
import { hybridSearchArticles, searchArticlesByVector } from '@/lib/vector-search';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const category = url.searchParams.get('category');
    const useVector = url.searchParams.get('vector') === 'true';
    
    if (!query) {
      return NextResponse.json(
        { success: false, message: 'Search query is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    let results;
    
    // Determine if we should use vector search
    if (useVector && process.env.ENABLE_VECTOR_SEARCH === 'true') {
      // Use hybrid search (vector + text)
      results = await hybridSearchArticles(query, {
        limit,
        category: category || null,
        vectorWeight: 0.7,
        textWeight: 0.3
      });
    } else {
      // Use traditional text search
      const skip = (page - 1) * limit;
      
      // Build query
      const searchQuery = {
        status: 'published',
        $text: { $search: query }
      };
      
      if (category) {
        searchQuery.category = category;
      }
      
      // Execute search
      results = await KnowledgeArticle.find(searchQuery, { score: { $meta: 'textScore' } })
        .select('title slug shortDescription category tags publishedDate viewCount')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .lean();
      
      // Get total count for pagination
      const total = await KnowledgeArticle.countDocuments(searchQuery);
      
      return NextResponse.json({
        success: true,
        results,
        searchType: 'text',
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      results,
      searchType: 'hybrid',
      // No pagination for vector search yet
      pagination: {
        page: 1,
        limit,
        total: results.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error performing search'
      },
      { status: 500 }
    );
  }
}