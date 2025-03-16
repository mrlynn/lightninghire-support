import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

/**
 * Session Info API Endpoint
 * 
 * This endpoint provides the current session information including
 * a secure JWT token that can be used for cross-site authentication.
 * 
 * It requires an authenticated user session to access.
 */
export async function GET(request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }
    
    // Create a token with essential user information for cross-site auth
    const token = sign(
      {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        auth_provider: session.user.auth_provider,
        // Add other necessary user data
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '5m' } // Short expiration for security
    );
    
    // Return user information and token
    // Never include sensitive information like password or full address
    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      },
      token
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    return NextResponse.json(
      { error: 'An error occurred while getting session info' },
      { status: 500 }
    );
  }
} 