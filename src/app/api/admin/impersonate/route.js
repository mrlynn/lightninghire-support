import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongoose';
import { sign } from 'jsonwebtoken';

// Import User model
let User;
try {
  User = require('@/models/User').default;
} catch (error) {
  console.warn('User model not found in current app, will try to use User from shared database');
  // We'll handle this in the POST function below
}

export async function POST(request) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin privileges
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'support_agent')) {
      return NextResponse.json(
        { message: 'Unauthorized. Admin privileges required.' },
        { status: 403 }
      );
    }
    
    // Get user ID to impersonate from request body
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If we couldn't import User model, try to get it from the mongoose models
    const mongoose = await import('mongoose');
    if (!User) {
      User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
    }
    
    // Find user to impersonate
    const userToImpersonate = await User.findById(userId);
    
    if (!userToImpersonate) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Create impersonation token
    const impersonationToken = sign(
      {
        id: userToImpersonate._id.toString(),
        email: userToImpersonate.email,
        name: userToImpersonate.name,
        role: userToImpersonate.role || 'user',
        isImpersonating: true,
        impersonatedUserId: userToImpersonate._id.toString(),
        impersonatedRole: userToImpersonate.role || 'user',
        originalUserId: session.user.id,
        originalRole: session.user.role,
      },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '1h' } // Shorter expiration for impersonation
    );
    
    // Log the impersonation event
    console.log(`Admin ${session.user.id} (${session.user.email}) impersonating user ${userId} (${userToImpersonate.email})`);
    
    // Return success with callback URL
    return NextResponse.json({
      message: 'Impersonation successful',
      callbackUrl: `/api/auth/callback/credentials?token=${impersonationToken}&callbackUrl=/`,
    });
    
  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during impersonation' },
      { status: 500 }
    );
  }
} 