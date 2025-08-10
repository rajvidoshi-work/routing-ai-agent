import { useEffect } from 'react';

/**
 * Custom hook to scroll to top when component mounts
 * Useful for page navigation to ensure users start at the top of new pages
 */
export const useScrollToTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

/**
 * Utility function to scroll to top programmatically
 * Can be called from event handlers or other functions
 */
export const scrollToTop = (behavior: ScrollBehavior = 'auto') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior
  });
};

/**
 * Smooth scroll to top function
 * Provides a smooth scrolling animation to the top
 */
export const smoothScrollToTop = () => {
  scrollToTop('smooth');
};
