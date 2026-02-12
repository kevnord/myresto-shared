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
export declare function getTheme(): 'dark' | 'light';
export declare function setTheme(theme: 'dark' | 'light'): void;
export declare function initTheme(): void;
//# sourceMappingURL=theme.d.ts.map