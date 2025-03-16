'use client';

import { useCallback } from 'react';
import { useUserActivity } from '@/context/UserActivityContext';

/**
 * Custom hook to track search interactions
 * @returns {Function} - Function to track search queries and results
 */
export function useSearchTracking() {
  const { trackSearch } = useUserActivity();

  // Function to track search queries and results
  const trackSearchQuery = useCallback(async (query, resultsCount) => {
    if (!query) return;
    
    await trackSearch(query, resultsCount);
  }, [trackSearch]);

  return trackSearchQuery;
} 