/**
 * Base API utilities for MyResto apps
 *
 * Usage in your app:
 * ```ts
 * import { createApiFetch } from '@myresto/shared/lib/api';
 *
 * const apiFetch = createApiFetch('/api');
 *
 * export const api = {
 *   getEvents: () => apiFetch<{ events: Event[] }>('/events'),
 *   createEvent: (data, token) => apiFetch('/events', { method: 'POST', body: data, token }),
 * };
 * ```
 */
export interface FetchOptions {
    method?: string;
    body?: unknown;
    token?: string | null;
    headers?: Record<string, string>;
}
/**
 * Create a typed API fetch function with a base URL
 */
export declare function createApiFetch(baseUrl?: string): <T>(path: string, opts?: FetchOptions) => Promise<T>;
/**
 * Create a file upload function for binary uploads (images, etc.)
 */
export declare function createFileUpload(baseUrl?: string): <T = {
    url: string;
}>(path: string, file: File, token?: string, additionalHeaders?: Record<string, string>) => Promise<T>;
//# sourceMappingURL=api.d.ts.map