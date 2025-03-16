import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
// Remove the standard LinkedIn provider import
// import LinkedInProvider from 'next-auth/providers/linkedin';
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
        password: { label: 'Password', type: 'password' },
        token: { label: 'Token', type: 'text' } // Add token field for cross-site auth
      },
      async authorize(credentials) {
        // Handle token-based authentication for cross-site login
        if (credentials?.token) {
          try {
            const { verify } = await import('jsonwebtoken');
            const decoded = verify(credentials.token, process.env.NEXTAUTH_SECRET);
            
            // Return user info from the token
            return {
              id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              role: decoded.role || 'user',
              image: decoded.image || null,
              auth_provider: decoded.auth_provider || 'token'
            };
          } catch (error) {
            console.error('Token verification error:', error);
            throw new Error('Invalid authentication token');
          }
        }
        
        // Regular email/password authentication
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
    // Replace LinkedInProvider with custom LinkedIn OIDC implementation
    {
      id: "linkedin",
      name: "LinkedIn",
      type: "oauth",
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      wellKnown: null,
      authorization: {
        url: "https://www.linkedin.com/oauth/v2/authorization",
        params: {
          scope: "openid profile email",
          response_type: "code"
        }
      },
      token: {
        url: "https://www.linkedin.com/oauth/v2/accessToken",
        async request(context) {
          const tokenParams = new URLSearchParams({
            grant_type: "authorization_code",
            code: context.params.code,
            redirect_uri: context.provider.callbackUrl,
            client_id: context.provider.clientId,
            client_secret: context.provider.clientSecret
          });
          
          const response = await fetch(context.provider.token.url, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: tokenParams
          });
          
          const tokens = await response.json();
          
          if (!response.ok) {
            console.error("LinkedIn token error:", tokens);
            throw new Error(tokens.error_description || "Failed to retrieve token");
          }
          
          return { tokens };
        }
      },
      userinfo: {
        url: "https://api.linkedin.com/v2/userinfo",
        async request({ tokens, provider }) {
          try {
            const response = await fetch(provider.userinfo.url, {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch LinkedIn userinfo`);
            }
            
            const userInfo = await response.json();
            return userInfo;
          } catch (error) {
            console.error("Error fetching LinkedIn userinfo:", error);
            throw error;
          }
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          auth_provider: 'linkedin'
        };
      }
    }
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
  // Add cookie configuration for cross-domain support
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        // Use a shared top-level domain for both main and support sites
        // domain: '.lightninghire.com' // Uncomment and customize when using a shared domain
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}; 