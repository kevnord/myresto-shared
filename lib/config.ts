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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AppId =
  | 'event'
  | 'garage'
  | 'club'
  | 'hub'
  | 'gear'
  | 'parts'
  | 'life'
  | 'rides'
  | 'track'
  | 'plate'
  | 'show';

export interface AppInfo {
  app: AppId;
  name: string;
}

// ---------------------------------------------------------------------------
// Domain → App mapping
// ---------------------------------------------------------------------------

export const APP_CONFIG: Record<string, AppInfo> = {
  // Production domains
  'myrestoevent.com': { app: 'event', name: 'MyResto Event' },
  'myrestogarage.com': { app: 'garage', name: 'MyResto Garage' },
  'myrestoclub.com': { app: 'club', name: 'MyResto Club' },
  'myrestohub.com': { app: 'hub', name: 'MyResto Hub' },
  'myrestogear.com': { app: 'gear', name: 'MyResto Gear' },
  'myrestoparts.com': { app: 'parts', name: 'MyResto Parts' },
  'myrestolife.com': { app: 'life', name: 'MyResto Life' },
  'myrestorides.com': { app: 'rides', name: 'MyResto Rides' },
  'myrestotrack.com': { app: 'track', name: 'MyResto Track' },
  'myrestoplate.com': { app: 'plate', name: 'MyResto Plate' },
  'myrestoshow.com': { app: 'show', name: 'MyResto Show' },

  // www variants
  'www.myrestoevent.com': { app: 'event', name: 'MyResto Event' },
  'www.myrestogarage.com': { app: 'garage', name: 'MyResto Garage' },
  'www.myrestoclub.com': { app: 'club', name: 'MyResto Club' },
  'www.myrestohub.com': { app: 'hub', name: 'MyResto Hub' },
  'www.myrestogear.com': { app: 'gear', name: 'MyResto Gear' },
  'www.myrestoparts.com': { app: 'parts', name: 'MyResto Parts' },
  'www.myrestolife.com': { app: 'life', name: 'MyResto Life' },
  'www.myrestorides.com': { app: 'rides', name: 'MyResto Rides' },
  'www.myrestotrack.com': { app: 'track', name: 'MyResto Track' },
  'www.myrestoplate.com': { app: 'plate', name: 'MyResto Plate' },
  'www.myrestoshow.com': { app: 'show', name: 'MyResto Show' },

  // Vercel preview domains (pattern: project.vercel.app)
  'myrestoevent.vercel.app': { app: 'event', name: 'MyResto Event' },
  'myrestogarage.vercel.app': { app: 'garage', name: 'MyResto Garage' },
  'myrestoclub.vercel.app': { app: 'club', name: 'MyResto Club' },
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Detect the current app based on hostname or `VITE_APP_ID` env var.
 *
 * Resolution order:
 * 1. Exact hostname match in `APP_CONFIG`
 * 2. `VITE_APP_ID` environment variable (for local dev / SSR)
 * 3. `null` if unrecognised
 */
export function getCurrentApp(): AppId | null {
  // In browser — check hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const entry = APP_CONFIG[hostname];
    if (entry) return entry.app;
  }

  // Fallback to env var (works for localhost / dev)
  const envAppId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_ID) as string | undefined;
  if (envAppId && isValidAppId(envAppId)) return envAppId;

  return null;
}

/**
 * Get full app info for the current app.
 */
export function getCurrentAppInfo(): AppInfo | null {
  const appId = getCurrentApp();
  if (!appId) return null;
  // Find first entry matching this appId
  for (const info of Object.values(APP_CONFIG)) {
    if (info.app === appId) return info;
  }
  return null;
}

function isValidAppId(value: string): value is AppId {
  return [
    'event', 'garage', 'club', 'hub', 'gear',
    'parts', 'life', 'rides', 'track', 'plate', 'show',
  ].includes(value);
}
