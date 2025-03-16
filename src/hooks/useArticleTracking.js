'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUserActivity } from '@/context/UserActivityContext';

/**
 * Custom hook to track article interactions
 * @param {string} articleId - The ID of the article being viewed
 * @param {string} title - The title of the article
 * @param {string[]} tags - Array of article tags/categories
 * @returns {Object} - Methods to interact with the article tracking
 */
export function useArticleTracking(articleId, title, tags = []) {
  const { trackArticleView, submitFeedback } = useUserActivity();
  const [trackingFinished, setTrackingFinished] = useState(false);
  const [endTracking, setEndTracking] = useState(null);

  // Initialize tracking when the component mounts
  useEffect(() => {
    if (!articleId || !title || trackingFinished) return;

    const initTracking = async () => {
      // Start tracking and get the callback function to end tracking
      const endTrackingFn = await trackArticleView(articleId, title, tags);
      setEndTracking(() => endTrackingFn);
    };

    initTracking();

    // Clean up the tracking when the component unmounts
    return () => {
      if (endTracking && !trackingFinished) {
        endTracking();
        setTrackingFinished(true);
      }
    };
  }, [articleId, title, tags, trackArticleView, endTracking, trackingFinished]);

  // Function to mark article as helpful or not
  const markHelpful = useCallback(async (isHelpful) => {
    if (!endTracking) return;
    
    // End the tracking with helpful flag
    await endTracking(isHelpful);
    setTrackingFinished(true);
  }, [endTracking]);

  // Function to submit detailed feedback
  const provideDetailedFeedback = useCallback(async (rating, comments) => {
    if (!articleId) return false;
    
    const success = await submitFeedback(articleId, 'article', rating, comments);
    
    // If we haven't ended tracking yet, do it now with the rating
    if (!trackingFinished && endTracking) {
      await endTracking(rating >= 4); // Consider 4-5 stars as helpful
      setTrackingFinished(true);
    }
    
    return success;
  }, [articleId, submitFeedback, endTracking, trackingFinished]);

  return {
    markHelpful,
    provideDetailedFeedback,
    isTracking: !!endTracking && !trackingFinished
  };
} 