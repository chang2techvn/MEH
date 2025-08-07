import { useState, useEffect } from 'react';

interface KeyboardState {
  height: number;
  isVisible: boolean;
}

export const useKeyboardHeight = (): KeyboardState => {
  const [keyboardState, setKeyboardState] = useState<KeyboardState>({
    height: 0,
    isVisible: false,
  });

  useEffect(() => {
    // Check if we're on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (!isMobile) {
      return;
    }

    const initialHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleViewportChange = () => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Debounce the calculation to avoid excessive updates
      timeoutId = setTimeout(() => {
        const currentHeight = window.visualViewport?.height || window.innerHeight;
        const heightDifference = initialHeight - currentHeight;
        
        // Consider keyboard visible if height difference > 150px
        // This threshold helps avoid false positives from browser UI changes
        const isVisible = heightDifference > 150;
        const keyboardHeight = isVisible ? heightDifference : 0;

        setKeyboardState(prev => {
          // Only update if there's a significant change
          if (Math.abs(prev.height - keyboardHeight) > 10 || prev.isVisible !== isVisible) {
            return {
              height: keyboardHeight,
              isVisible,
            };
          }
          return prev;
        });
      }, 100); // Debounce for 100ms
    };

    // Try to use Visual Viewport API first (most accurate)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
    }

    // Fallback to window resize event
    window.addEventListener('resize', handleViewportChange);

    // Also listen to orientationchange for mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(handleViewportChange, 500); // Delay after orientation change
    });

    // Initial check
    handleViewportChange();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
    };
  }, []);

  return keyboardState;
};
