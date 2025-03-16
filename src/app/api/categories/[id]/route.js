// src/app/api/categories/[id]/route.js
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import ArticleCategory from '@/models/ArticleCategory';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    
    await connectToDatabase();
    
    const category = await ArticleCategory.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error getting category:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error retrieving category'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const data = await req.json();
    
    // For now, we're skipping authentication checks
    // In a real environment, you would verify admin roles here
    
    await connectToDatabase();
    
    const category = await ArticleCategory.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Update the category
    Object.assign(category, data);
    await category.save();
    
    return NextResponse.json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error updating category'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    
    // For now, we're skipping authentication checks
    // In a real environment, you would verify admin roles here
    
    await connectToDatabase();
    
    const category = await ArticleCategory.findById(id);
    
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Delete the category
    await category.deleteOne();
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error deleting category'
      },
      { status: 500 }
    );
  }
}