// src/app/api/categories/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';

export async function GET(req) {
  try {
    const url = new URL(req.url);
    
    await connectToDatabase();
    
    // Get only active categories by default
    const isActive = url.searchParams.get('isActive') === 'false' ? false : true;
    const query = url.searchParams.has('isActive') ? { isActive } : {};
    
    const categories = await ArticleCategory.find(query)
      .sort({ order: 1, name: 1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving categories'
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    
    // For now, we're skipping authentication checks
    // In a real environment, you would verify admin roles here
    
    await connectToDatabase();
    
    // Create the category
    const category = new ArticleCategory(data);
    await category.save();
    
    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error creating category'
      },
      { status: 500 }
    );
  }
}