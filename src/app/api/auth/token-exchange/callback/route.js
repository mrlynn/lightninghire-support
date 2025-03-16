import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

/**
 * Token Exchange Callback API Endpoint
 * 
 * This endpoint handles incoming token exchange requests from the main application.
 * It verifies the token and redirects to the appropriate callback URL with
 * the token as a parameter for NextAuth to use for authentication.
 */
export async function GET(request) {
  try {
    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    if (!token) {
      // Redirect to login if no token provided
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Verify token is valid
    try {
      verify(token, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      console.error('Invalid token in callback:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Redirect to the NextAuth callback endpoint with the token
    // This will establish a session based on the token
    const nextAuthCallbackUrl = new URL(
      `/api/auth/callback/credentials?token=${encodeURIComponent(token)}&callbackUrl=${encodeURIComponent(callbackUrl)}`,
      request.url
    );
    
    return NextResponse.redirect(nextAuthCallbackUrl);
  } catch (error) {
    console.error('Error in token exchange callback:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
} 