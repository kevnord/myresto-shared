/**
 * App configuration and domain mapping for the MyResto ecosystem.
 *
 * Each MyResto site maps to an `AppId`. Use `getCurrentApp()` to detect
 * which app is running based on `window.location.hostname`, with a
 * fallback to the `VITE_APP_ID` env var for local development.
 *
 * @example
 * ```ts
 * import { getCurrentApp, APP_CONFIG } from '@myresto/shared/lib/config';
 * const app = getCurrentApp(); // 'event' | 'garage' | ...
 * ```
 */
export type AppId = 'event' | 'garage' | 'club' | 'hub' | 'gear' | 'parts' | 'life' | 'rides' | 'track' | 'plate' | 'show';
export interface AppInfo {
    app: AppId;
    name: string;
}
export declare const APP_CONFIG: Record<string, AppInfo>;
/**
 * Detect the current app based on hostname or `VITE_APP_ID` env var.
 *
 * Resolution order:
 * 1. Exact hostname match in `APP_CONFIG`
 * 2. `VITE_APP_ID` environment variable (for local dev / SSR)
 * 3. `null` if unrecognised
 */
export declare function getCurrentApp(): AppId | null;
/**
 * Get full app info for the current app.
 */
export declare function getCurrentAppInfo(): AppInfo | null;
//# sourceMappingURL=config.d.ts.map