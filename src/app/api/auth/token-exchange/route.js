import { NextResponse } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

/**
 * Token Exchange API Endpoint
 * 
 * This endpoint allows secure authentication token exchange between 
 * the main LightningHire application and the support portal.
 * 
 * It accepts a token from the other application, verifies it using the shared
 * NEXTAUTH_SECRET, and returns a new valid token for this application.
 */
export async function POST(request) {
  try {
    // Check if API key is valid for server-to-server communication
    const apiKey = request.headers.get('x-api-key');
    const isValidApiKey = apiKey === process.env.API_KEY;
    
    if (!isValidApiKey) {
      // If no API key, check if user has a valid session
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized. Valid API key or authentication required.' },
          { status: 401 }
        );
      }
    }
    
    // Get token from request body
    const { token, callbackUrl } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Verify the token from the other site
    let decoded;
    try {
      decoded = verify(token, process.env.NEXTAUTH_SECRET);
    } catch (error) {
      console.error('Token verification error:', error);
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Create a new token for this site with the same user info
    const newToken = sign(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        auth_provider: decoded.auth_provider,
        // Include other necessary user data
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '30d' }
    );
    
    // Return the new token and a callbackUrl that NextAuth can use
    return NextResponse.json({
      success: true,
      token: newToken,
      callbackUrl: `/api/auth/callback/credentials?token=${newToken}&callbackUrl=${callbackUrl || '/'}`,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { error: 'An error occurred during token exchange' },
      { status: 500 }
    );
  }
} 