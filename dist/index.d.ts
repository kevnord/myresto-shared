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
export * from './lib/api';
export * from './lib/auth';
export * from './lib/brand';
export * from './lib/theme';
export { default as Footer } from './components/Footer';
export { ErrorBoundary, default as ErrorBoundaryDefault } from './components/ErrorBoundary';
//# sourceMappingURL=index.d.ts.map