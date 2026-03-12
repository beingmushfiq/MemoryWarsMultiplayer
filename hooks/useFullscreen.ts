import { useState, useEffect, useCallback } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Helper function to get the current fullscreen element, checking all vendor prefixes.
  const getFullscreenElement = () =>
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement;

  // Helper function to request fullscreen, checking all vendor prefixes.
  const requestFullscreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) { /* Safari */
      (element as any).webkitRequestFullscreen();
    } else if ((element as any).mozRequestFullScreen) { /* Firefox */
      (element as any).mozRequestFullScreen();
    } else if ((element as any).msRequestFullscreen) { /* IE11 */
      (element as any).msRequestFullscreen();
    }
  };

  // Helper function to exit fullscreen, checking all vendor prefixes.
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) { /* Safari */
      (document as any).webkitExitFullscreen();
    } else if ((document as any).mozCancelFullScreen) { /* Firefox */
      (document as any).mozCancelFullScreen();
    } else if ((document as any).msExitFullscreen) { /* IE11 */
      (document as any).msExitFullscreen();
    }
  };

  // Callback to update the state when fullscreen status changes.
  const updateFullscreenState = useCallback(() => {
    setIsFullscreen(!!getFullscreenElement());
  }, []);

  useEffect(() => {
    // Set the initial state
    updateFullscreenState();
    
    // Add event listeners for all possible vendor-prefixed fullscreen change events.
    document.addEventListener('fullscreenchange', updateFullscreenState);
    document.addEventListener('webkitfullscreenchange', updateFullscreenState);
    document.addEventListener('mozfullscreenchange', updateFullscreenState);
    document.addEventListener('MSFullscreenChange', updateFullscreenState);

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('fullscreenchange', updateFullscreenState);
      document.removeEventListener('webkitfullscreenchange', updateFullscreenState);
      document.removeEventListener('mozfullscreenchange', updateFullscreenState);
      document.removeEventListener('MSFullscreenChange', updateFullscreenState);
    };
  }, [updateFullscreenState]);

  // The function to toggle fullscreen mode.
  const toggleFullscreen = useCallback(() => {
    if (getFullscreenElement()) {
      exitFullscreen();
    } else {
      requestFullscreen(document.documentElement);
    }
  }, []);

  return { isFullscreen, toggleFullscreen };
};