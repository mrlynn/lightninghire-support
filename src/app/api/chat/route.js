// src/app/api/chat/route.js
import { NextResponse } from 'next/server';
import { chatService } from '@/services/chatService';

export async function POST(req) {
  try {
    const data = await req.json();
    const { message, conversationId, sessionId } = data;
    
    if (!message) {
      return NextResponse.json(
        { success: false, message: 'Message is required' },
        { status: 400 }
      );
    }
    
    // For now, we'll skip authentication checks
    // In a real environment, you would get the user from the session
    const userId = null;
    
    // Get client metadata
    const metadata = {
      userAgent: req.headers.get('user-agent') || '',
      ipAddress: req.headers.get('x-forwarded-for') || '',
      referrer: req.headers.get('referer') || '',
      path: req.headers.get('x-invoke-path') || '',
    };
    
    // Generate response using RAG
    const response = await chatService.generateResponse(
      conversationId,
      message,
      sessionId || 'anonymous-session',
      userId,
      metadata
    );
    
    return NextResponse.json({
      success: true,
      answer: response.answer,
      sources: response.sources,
      conversationId: response.conversationId,
      messageId: response.messageId
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Error processing chat request'
      },
      { status: 500 }
    );
  }
}