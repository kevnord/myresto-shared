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
export function createApiFetch(baseUrl: string = '/api') {
  return async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
    const headers: Record<string, string> = {
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
export function createFileUpload(baseUrl: string = '/api') {
  return async function uploadFile<T = { url: string }>(
    path: string, 
    file: File, 
    token?: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = {
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
