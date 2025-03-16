import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

export async function POST() {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is currently impersonating
    if (!session || !session.isImpersonating) {
      return NextResponse.json(
        { message: 'Not currently impersonating any user' },
        { status: 400 }
      );
    }
    
    // Create token with original admin credentials
    const adminToken = sign(
      {
        id: session.originalUserId,
        role: session.originalRole,
        // Don't include isImpersonating flag to end impersonation
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '30d' }
    );
    
    // Log the end of impersonation
    console.log(`Ending impersonation: Admin ${session.originalUserId} returning from impersonating user ${session.user.id}`);
    
    // Return success with callback URL
    return NextResponse.json({
      message: 'Impersonation ended successfully',
      callbackUrl: `/api/auth/callback/credentials?token=${adminToken}&callbackUrl=/admin`,
    });
    
  } catch (error) {
    console.error('Error ending impersonation:', error);
    return NextResponse.json(
      { message: 'An error occurred while ending impersonation' },
      { status: 500 }
    );
  }
} 