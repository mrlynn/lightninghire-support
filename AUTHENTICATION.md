# Lightning Hire Authentication System - Product Brief

## Overview

Lightning Hire's authentication system provides a secure, flexible multi-provider authentication mechanism that supports credential-based login, social authentication, and seamless account linking. Built on NextAuth.js with MongoDB integration, the system creates a unified user experience while maintaining strong security practices.

## Authentication Features

### Multi-Provider Authentication

The system supports three authentication methods:
- **Email/Password**: Traditional credential-based authentication
- **Google OAuth**: Single-sign-on with Google accounts
- **LinkedIn OAuth**: Professional identity verification through LinkedIn

### Intelligent Account Linking

Users can access their account through multiple authentication methods with automatic account linking:
- Accounts with matching email addresses are automatically linked
- User profiles are progressively enriched as they authenticate through different providers
- Login history and provider usage are tracked and stored

### Login Flow & Session Management

1. **Login Initiation**: Users can choose their preferred authentication method from the login page
2. **Authentication**: Validation through selected provider (credentials/Google/LinkedIn)
3. **Account Resolution**: System identifies existing accounts or creates new ones
4. **Session Creation**: Secure JWT-based sessions with a 30-day validity
5. **Onboarding Check**: New users are directed to the onboarding survey
6. **Dashboard Access**: Authenticated users access their personalized dashboard

### Admin Capabilities

The system includes special features for administrators:
- **User Impersonation**: Admins can view the system as specific users for support purposes
- **Impersonation Reversion**: Simple mechanism to return to admin privileges
- **Enhanced Logging**: Detailed authentication events for audit purposes

## Technical Implementation

### Architecture Components

1. **NextAuth Integration**:
   - Custom configuration of NextAuth with MongoDB adapter
   - JWT strategy for session persistence and management
   - Provider-specific authentication flows

2. **User Identity Management**:
   - MongoDB-based user storage with provider-specific identifiers
   - Email-based account linking across providers
   - Last login tracking and authentication history

3. **Authentication Routes**:
   - `/login`: Entry point for all authentication methods
   - `/api/auth/[...nextauth]`: NextAuth API routes
   - `/auth/callback`: Post-authentication processing
   - `/register`: New user registration

### Security Considerations

- Secure password hashing with bcrypt
- JWT-based session tokens with secure storage
- CSRF protection through NextAuth
- Provider-specific security features (OAuth standards compliance)
- Detailed error logging with privacy protections

## User Flows

### New User Registration

1. User visits the registration page
2. User provides required information (name, email, password)
3. System validates email uniqueness and password strength
4. User account is created and session established
5. User is directed to onboarding survey
6. Upon completion, user accesses their dashboard

### Returning User Login

1. User selects preferred authentication method
2. User completes authentication through selected provider
3. System verifies identity and retrieves user profile
4. System updates last login time and authentication history
5. User is directed to their dashboard

### Account Linking (Automatic)

1. User authenticates through a new provider with an email matching their existing account
2. System identifies the matching account and links the new provider
3. Session is created with the user's existing profile data
4. User continues with their established account with enriched profile data

### Admin Impersonation

1. Admin initiates impersonation of a specific user
2. System preserves admin's original identity and creates impersonation session
3. Admin interacts with the system as the impersonated user
4. Admin clicks "End Impersonation" to revert to admin identity
5. System restores admin privileges and session

## Key Files and Components

### Core Authentication Files

1. **NextAuth Configuration** (`/app/api/auth/[...nextauth]/route.js`):
   - Provider setup and configuration
   - JWT and session callbacks
   - Account linking logic

2. **Login Component** (`/components/auth/LoginForm.jsx`):
   - UI for authentication method selection
   - Credential form handling
   - Social login buttons

3. **Registration Component** (`/components/auth/RegisterForm.jsx`):
   - New user information collection
   - Password validation
   - Account creation flow

4. **Auth Callback Handler** (`/app/(auth)/auth/callback/page.js`):
   - Post-authentication processing
   - Survey completion verification
   - User redirection logic

## How It Works: Technical Deep Dive

### Authentication Initialization

When a user visits the login page, the system presents three login options:
1. Email/Password
2. Google OAuth
3. LinkedIn OAuth

The UI components handle form validation and authentication method selection, triggering the appropriate NextAuth flow.

### Provider-Specific Authentication

#### Email/Password Authentication:
1. User credentials are submitted to NextAuth's credentials provider
2. System verifies email existence in the database
3. Password is compared with stored hash using bcrypt
4. On success, user profile is retrieved and session established

#### OAuth Authentication (Google/LinkedIn):
1. User is redirected to provider's authentication page
2. User grants permission to Lightning Hire
3. Provider returns authentication code
4. System exchanges code for access token
5. User profile information is retrieved from provider API
6. System checks for existing accounts with matching email

### Account Linking Mechanism

The account linking strategy focuses on email as the unique identifier:

1. **New OAuth Login**:
   - System checks if a user with the same email exists
   - If found, the OAuth provider ID is added to the existing account
   - If not found, a new user account is created

2. **Provider Information Storage**:
   - Each provider's unique identifier is stored (e.g., `googleId`, `linkedinId`)
   - Provider-specific profile data (e.g., profile pictures) enhances user accounts
   - Login timestamps and history are updated

### Session Management

Lightning Hire uses JWT-based sessions with NextAuth:

1. **Token Creation**:
   - JWT token contains user ID, name, email, subscription info, and role
   - Authentication provider is recorded for analytics and security
   - Impersonation status is tracked when applicable

2. **Session Lifetime**:
   - Sessions last 30 days by default
   - Silent re-authentication occurs when sessions are valid
   - Invalid sessions redirect to the login page

### Post-Authentication Processing

After successful authentication, the system:

1. Checks if the user has completed onboarding survey
2. Updates last login timestamps
3. Stores authentication provider information
4. Generates system messages if needed
5. Redirects users to appropriate pages based on onboarding status

## Future Enhancements

The authentication system has been designed for extensibility. Planned future enhancements include:

1. **Two-Factor Authentication (2FA)**:
   - Email verification codes
   - Authentication app integration
   - SMS verification options

2. **Single Sign-On Expansion**:
   - Microsoft/Office 365 integration
   - SAML support for enterprise customers
   - Custom OAuth provider configuration

3. **Advanced Security Features**:
   - Login anomaly detection
   - Geographic login restrictions
   - Advanced password policies
   - Security event notifications

4. **User Management Enhancements**:
   - Self-service account merging
   - User profile data management
   - Enhanced privacy controls
   - Data export capabilities

## Conclusion

Lightning Hire's authentication system provides a robust foundation for user identity management with a focus on security, usability, and flexibility. By supporting multiple authentication providers and intelligent account linking, the system creates a seamless user experience while maintaining strong security practices. This system is designed to scale with the platform and accommodate future authentication needs.