'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'fmsys-theme';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  // Read the theme already set by the blocking script in layout.tsx
  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
  }, []);

  function toggle() {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
    setIsDark(!isDark);
  }

  return { isDark, toggle };
}

/**
 * Inlined as a blocking <script> in layout.tsx to set data-theme before
 * first paint, preventing a flash of unstyled content (FOUC).
 */
export const themeInitScript = `(function(){
  var s = localStorage.getItem('${STORAGE_KEY}');
  var dark = s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
})();`;
