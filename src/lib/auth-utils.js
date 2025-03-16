/**
 * Authentication Utilities for Cross-Site Authentication
 * 
 * These utilities help manage authentication between the main Lightning Hire
 * application and the support portal.
 */

/**
 * Get the currently active session JWT token
 * This works with NextAuth.js and can be used for cross-site authentication
 */
export const getSessionToken = async () => {
  try {
    // Using sessionStorage as a simple way to access the active token
    // This depends on how NextAuth stores its session
    const session = await fetch('/api/auth/session');
    const data = await session.json();
    
    if (!data || !data.user) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

/**
 * Navigate to the main Lightning Hire application with authentication
 * @param {string} destination - The path on the main app to navigate to
 */
export const navigateToMainApp = async (destination = '/') => {
  try {
    // Get the current session
    const sessionData = await getSessionToken();
    
    if (!sessionData) {
      // If no session, just redirect to the main app login
      window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/login?callbackUrl=${encodeURIComponent(destination)}`;
      return;
    }
    
    // First, we need to get a token that the main app will accept
    const response = await fetch('/api/auth/session-info');
    const data = await response.json();
    
    if (data.token) {
      // Redirect to the main app's token exchange endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/api/auth/token-exchange/callback?token=${encodeURIComponent(data.token)}&callbackUrl=${encodeURIComponent(destination)}`;
    } else {
      // Fallback to regular login
      window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/login?callbackUrl=${encodeURIComponent(destination)}`;
    }
  } catch (error) {
    console.error('Error navigating to main app:', error);
    // Fallback to regular login
    window.location.href = `${process.env.NEXT_PUBLIC_MAIN_APP_URL}/login`;
  }
};

/**
 * Navigate to the support portal with authentication
 * @param {string} destination - The path on the support portal to navigate to
 */
export const navigateToSupportPortal = async (destination = '/') => {
  try {
    // Get the current session
    const sessionData = await getSessionToken();
    
    if (!sessionData) {
      // If no session, just redirect to the support portal login
      window.location.href = `${process.env.NEXT_PUBLIC_SUPPORT_PORTAL_URL}/login?callbackUrl=${encodeURIComponent(destination)}`;
      return;
    }
    
    // First, we need to get a token that the support portal will accept
    const response = await fetch('/api/auth/session-info');
    const data = await response.json();
    
    if (data.token) {
      // Redirect to the support portal's token exchange endpoint
      window.location.href = `${process.env.NEXT_PUBLIC_SUPPORT_PORTAL_URL}/api/auth/token-exchange/callback?token=${encodeURIComponent(data.token)}&callbackUrl=${encodeURIComponent(destination)}`;
    } else {
      // Fallback to regular login
      window.location.href = `${process.env.NEXT_PUBLIC_SUPPORT_PORTAL_URL}/login?callbackUrl=${encodeURIComponent(destination)}`;
    }
  } catch (error) {
    console.error('Error navigating to support portal:', error);
    // Fallback to regular login
    window.location.href = `${process.env.NEXT_PUBLIC_SUPPORT_PORTAL_URL}/login`;
  }
}; 