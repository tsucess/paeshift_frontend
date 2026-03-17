import { useState, useEffect } from 'react';

/**
 * Custom hook to check if Google Maps API is loaded
 * @returns {boolean} - True if Google Maps API is loaded, false otherwise
 */
export const useGoogleMapsLoaded = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    const checkGoogleMapsLoaded = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsLoaded(true);
        return true;
      }
      return false;
    };

    // If already loaded, set state immediately
    if (checkGoogleMapsLoaded()) {
      return;
    }

    // Otherwise, wait for it to load
    const checkInterval = setInterval(() => {
      if (checkGoogleMapsLoaded()) {
        clearInterval(checkInterval);
      }
    }, 100);

    // Cleanup interval on unmount
    return () => clearInterval(checkInterval);
  }, []);

  return isLoaded;
};

export default useGoogleMapsLoaded;

