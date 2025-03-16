'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Create the context
const UserActivityContext = createContext();

// Custom hook to use the user activity context
export const useUserActivity = () => {
  const context = useContext(UserActivityContext);
  if (!context) {
    throw new Error('useUserActivity must be used within a UserActivityProvider');
  }
  return context;
};

export function UserActivityProvider({ children }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch extended user profile when session changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/users/${session.user.id}/profile`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user profile');
          }
          
          const data = await response.json();
          setUserProfile(data);
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      } else if (status === 'unauthenticated') {
        setUserProfile(null);
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [session, status]);

  // Track article views
  const trackArticleView = async (articleId, title) => {
    if (!session?.user?.id) return;
    
    const startTime = Date.now();
    
    // Return a function to call when user leaves the article
    return async (wasHelpful = null) => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds
      
      try {
        const response = await fetch('/api/users/track-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'articleView',
            data: {
              articleId,
              title,
              timeSpent,
              helpful: wasHelpful
            }
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to track article view');
        }
        
        // Update local state if successful
        if (userProfile) {
          setUserProfile(prev => ({
            ...prev,
            supportStats: {
              ...prev.supportStats,
              articlesRead: (prev.supportStats?.articlesRead || 0) + 1
            }
          }));
        }
      } catch (err) {
        console.error('Error tracking article view:', err);
      }
    };
  };

  // Track search activity
  const trackSearch = async (query, resultsCount) => {
    if (!session?.user?.id) return;
    
    try {
      await fetch('/api/users/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'search',
          data: {
            query,
            resultsCount
          }
        })
      });
    } catch (err) {
      console.error('Error tracking search:', err);
    }
  };

  // Track ticket creation
  const trackTicketCreation = async (ticketId, title) => {
    if (!session?.user?.id) return;
    
    try {
      await fetch('/api/users/track-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ticketCreation',
          data: {
            ticketId,
            title
          }
        })
      });
      
      // Update local state
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          supportStats: {
            ...prev.supportStats,
            ticketsCreated: (prev.supportStats?.ticketsCreated || 0) + 1
          }
        }));
      }
    } catch (err) {
      console.error('Error tracking ticket creation:', err);
    }
  };

  // Submit feedback
  const submitFeedback = async (itemId, itemType, rating, comments) => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/users/submit-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          itemType,
          rating,
          comments
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }
      
      // Update local state
      if (userProfile) {
        setUserProfile(prev => ({
          ...prev,
          supportStats: {
            ...prev.supportStats,
            feedbackGiven: (prev.supportStats?.feedbackGiven || 0) + 1
          }
        }));
      }
      
      return true;
    } catch (err) {
      console.error('Error submitting feedback:', err);
      return false;
    }
  };

  return (
    <UserActivityContext.Provider
      value={{
        userProfile,
        isLoading,
        error,
        trackArticleView,
        trackSearch,
        trackTicketCreation,
        submitFeedback
      }}
    >
      {children}
    </UserActivityContext.Provider>
  );
} 