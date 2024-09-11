import { useState, useEffect, useCallback } from 'react';

export const useMediaQuery = (maxWidth: number): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  const query = `(max-width: ${maxWidth}px)`;

  const handleChange = useCallback((e: MediaQueryListEvent) => {
    setMatches(e.matches);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    } else {
      mediaQuery.addEventListener('change', handleChange);
    }

    return () => {
      if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      } else {
        mediaQuery.removeEventListener('change', handleChange);
      }
    };
  }, [query, handleChange]);

  return matches;
};