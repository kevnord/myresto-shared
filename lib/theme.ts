/**
 * Theme utilities for dark/light mode management
 * 
 * Usage:
 * ```ts
 * import { initTheme, getTheme, setTheme } from '@myresto/shared/lib/theme';
 * 
 * // Initialize on app startup
 * initTheme();
 * 
 * // Toggle theme
 * const current = getTheme();
 * setTheme(current === 'dark' ? 'light' : 'dark');
 * ```
 */

export function getTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') return stored;
  // Default to dark — Electric Blue dark mode is the primary MyResto design
  return 'dark';
}

export function setTheme(theme: 'dark' | 'light') {
  localStorage.setItem('theme', theme);
  document.documentElement.dataset.theme = theme;
}

export function initTheme() {
  setTheme(getTheme());
}
