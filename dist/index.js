/**
 * @myresto/shared — Shared utilities and components for MyResto ecosystem
 *
 * @example
 * ```ts
 * // Import utilities
 * import { initTheme, createBrand, createApiFetch } from '@myresto/shared';
 *
 * // Import components
 * import Footer from '@myresto/shared/components/Footer';
 *
 * // Import auth
 * import { useAuth, UserButton } from '@myresto/shared/lib/auth';
 * ```
 */
// Export lib utilities
export * from './lib/api';
export * from './lib/auth';
export * from './lib/brand';
export * from './lib/theme';
// Export components (default exports need re-export)
export { default as Footer } from './components/Footer';
export { ErrorBoundary, default as ErrorBoundaryDefault } from './components/ErrorBoundary';
// Test utilities available via direct import: @myresto/shared/test/mockAuth
//# sourceMappingURL=index.js.map