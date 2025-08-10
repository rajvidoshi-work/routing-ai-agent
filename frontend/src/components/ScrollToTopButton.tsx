import React, { useState, useEffect } from 'react';
import { smoothScrollToTop } from '../hooks/useScrollToTop';

interface ScrollToTopButtonProps {
  showAfter?: number; // Show button after scrolling this many pixels
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ showAfter = 300 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, [showAfter]);

  const handleClick = () => {
    smoothScrollToTop();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="scroll-to-top-btn"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '18px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0056b3';
        e.currentTarget.style.transform = 'scale(1.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#007bff';
        e.currentTarget.style.transform = 'scale(1)';
      }}
      title="Scroll to top"
    >
      ↑
    </button>
  );
};

export default ScrollToTopButton;
