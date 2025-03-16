import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { connectToDatabase } from '@/lib/mongoose';
import { compare } from 'bcrypt';

// Import User model from main Lightning Hire app
// This assumes both apps share the same database
let User;
try {
  User = require('@/models/User').default;
} catch (error) {
  console.warn('User model not found in current app, will try to use User from shared database');
  // We'll handle this in the authorize function below
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }
        
        await connectToDatabase();
        
        // If we couldn't import User model, try to get it from the mongoose models
        const mongoose = await import('mongoose');
        if (!User) {
          User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
        }
        
        // Find user by email
        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        
        if (!user) {
          throw new Error('No user found with this email');
        }
        
        // Check password
        const isPasswordValid = await compare(credentials.password, user.password);
        
        if (!isPasswordValid) {
          throw new Error('Invalid password');
        }

        // Check if user has access to support portal
        if (!user.role && !user.isAdmin) {
          throw new Error('You do not have access to the support portal');
        }
        
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role || (user.isAdmin ? 'admin' : 'user'),
          image: user.image || null
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          auth_provider: 'google'
        };
      }
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      authorization: {
        params: { scope: 'r_emailaddress r_liteprofile' }
      },
      profile(profile) {
        return {
          id: profile.id,
          name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
          email: profile.email,
          image: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier || null,
          auth_provider: 'linkedin'
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false; // Require email for all authentication methods
      }
      
      await connectToDatabase();
      
      // Get mongoose if User model isn't available
      const mongoose = await import('mongoose');
      if (!User) {
        User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}));
      }
      
      // For OAuth providers, check if user with this email already exists
      if (account.provider !== 'credentials') {
        const existingUser = await User.findOne({ email: user.email.toLowerCase() });
        
        if (existingUser) {
          // Update the existing user with provider information for account linking
          const providerField = `${account.provider}Id`;
          const updates = {
            [providerField]: user.id,
            auth_provider: existingUser.auth_provider || account.provider,
            last_login: new Date()
          };
          
          // Update profile image if not already set
          if (!existingUser.image && user.image) {
            updates.image = user.image;
          }
          
          await User.findByIdAndUpdate(existingUser._id, updates);
          
          // Return true to allow sign in with the existing account
          return true;
        } else {
          // Create a new user with OAuth provider information
          const newUser = new User({
            name: user.name,
            email: user.email.toLowerCase(),
            username: user.email.toLowerCase(),
            image: user.image,
            auth_provider: account.provider,
            [`${account.provider}Id`]: user.id,
            role: 'user', // Default role
            created_at: new Date(),
            last_login: new Date()
          });
          
          await newUser.save();
          
          // Check if new users should have access to support portal
          // This is a placeholder - adjust based on your requirements
          return true;
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        
        // Store the authentication provider in the token
        if (account) {
          token.auth_provider = account.provider;
        }
      }
      
      // Handle admin impersonation
      if (token.isImpersonating) {
        // Preserve admin status in originalRole
        token.originalRole = token.originalRole || token.role;
        
        // Set token to impersonated user's role
        token.role = token.impersonatedRole;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.auth_provider = token.auth_provider;
        
        // Add impersonation information to session if applicable
        if (token.isImpersonating) {
          session.isImpersonating = true;
          session.impersonatedUserId = token.impersonatedUserId;
          session.originalRole = token.originalRole;
        }
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 