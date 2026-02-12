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
/**
 * Create a typed API fetch function with a base URL
 */
export function createApiFetch(baseUrl = '/api') {
    return async function apiFetch(path, opts = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...opts.headers,
        };
        if (opts.token) {
            headers['Authorization'] = `Bearer ${opts.token}`;
        }
        const res = await fetch(`${baseUrl}${path}`, {
            method: opts.method || 'GET',
            headers,
            body: opts.body ? JSON.stringify(opts.body) : undefined,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `API error ${res.status}`);
        }
        return res.json();
    };
}
/**
 * Create a file upload function for binary uploads (images, etc.)
 */
export function createFileUpload(baseUrl = '/api') {
    return async function uploadFile(path, file, token, additionalHeaders) {
        const headers = {
            'Content-Type': file.type,
            'X-Content-Type': file.type,
            ...additionalHeaders,
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(`${baseUrl}${path}`, {
            method: 'POST',
            headers,
            body: file,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || `Upload error ${res.status}`);
        }
        return res.json();
    };
}
//# sourceMappingURL=api.js.map