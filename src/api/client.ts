/**
 * client.ts — Production HTTP client with interceptors, retry, and ETag support.
 *
 * Uses native `fetch` — no extra dependencies needed.
 * Features:
 *   - Auto-attach Supabase JWT or x-api-key
 *   - ETag caching (If-None-Match → 304 handling)
 *   - Exponential retry with jitter for 5xx/network errors
 *   - Request timeout (15s default)
 *   - 401 → trigger token refresh
 *   - Structured error responses
 */
import { supabase } from '../auth/supabaseClient';
import { env } from '../config/env';
import type { ApiError } from '../types/api';

// ── ETag Cache ────────────────────────────────────────────────────────────
// In-memory ETag cache: url → { etag, data }
const etagCache = new Map<string, { etag: string; data: unknown }>();

// ── Types ─────────────────────────────────────────────────────────────────
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;       // ms, default 15000
  retries?: number;       // default 3 for GET, 0 for mutations
  useEtag?: boolean;      // default true for GET
  skipAuth?: boolean;     // skip auth headers (for health check)
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Core request method with all production features.
   */
  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers: extraHeaders = {},
      timeout = 15000,
      retries = method === 'GET' ? 3 : 0,
      useEtag = method === 'GET',
      skipAuth = false,
    } = options;

    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extraHeaders,
    };

    // ── Auth interceptor ──────────────────────────────────────────────
    if (!skipAuth) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      } else if (env.APP_API_KEY) {
        // Fallback: use app-level API key for unauthenticated browsing
        headers['x-api-key'] = env.APP_API_KEY;
      }
    }

    // ── ETag interceptor ──────────────────────────────────────────────
    if (useEtag) {
      const cached = etagCache.get(url);
      if (cached) {
        headers['If-None-Match'] = cached.etag;
      }
    }

    // ── Retry loop ────────────────────────────────────────────────────
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // ── 304 Not Modified → return cached data ─────────────────────
        if (response.status === 304 && useEtag) {
          const cached = etagCache.get(url);
          if (cached) {
            return cached.data as T;
          }
        }

        // ── 2xx success ───────────────────────────────────────────────
        if (response.ok) {
          // Handle 204 No Content
          if (response.status === 204) {
            return undefined as T;
          }

          const data = await response.json();

          // Store ETag for future requests
          const etag = response.headers.get('ETag');
          if (etag && useEtag) {
            etagCache.set(url, { etag, data });
          }

          return data as T;
        }

        // ── 401 Unauthorized → try token refresh once ─────────────────
        if (response.status === 401 && attempt === 0) {
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (!refreshError) {
            // Retry this request with new token
            continue;
          }
          // Refresh failed → user needs to re-login
          const err: ApiError = {
            status: 401,
            error: 'Session expired. Please sign in again.',
          };
          throw err;
        }

        // ── 429 Rate Limited → wait and retry ─────────────────────────
        if (response.status === 429 && attempt < retries) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
          await this.sleep(retryAfter * 1000);
          continue;
        }

        // ── 5xx Server Error → retry with backoff ─────────────────────
        if (response.status >= 500 && attempt < retries) {
          await this.sleepWithJitter(attempt);
          continue;
        }

        // ── Client error (4xx) → throw immediately ────────────────────
        let errorBody: ApiError;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = {
            status: response.status,
            error: response.statusText || 'Request failed',
          };
        }
        throw {
          status: response.status,
          error: errorBody.error || errorBody.detail || response.statusText,
          detail: errorBody.detail,
        } as ApiError;

      } catch (err: unknown) {
        // ── Network/Timeout errors → retry ────────────────────────────
        if (err instanceof DOMException && err.name === 'AbortError') {
          lastError = new Error(`Request timeout after ${timeout}ms`);
          if (attempt < retries) {
            await this.sleepWithJitter(attempt);
            continue;
          }
        } else if (err instanceof TypeError && err.message.includes('fetch')) {
          // Network error (server down, DNS failure, etc.)
          lastError = new Error('Network error — server may be unavailable');
          if (attempt < retries) {
            await this.sleepWithJitter(attempt);
            continue;
          }
        } else {
          // ApiError or unknown → throw immediately
          throw err;
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error('Request failed after all retries');
  }

  // ── Convenience methods ─────────────────────────────────────────────────

  get<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, 'method'>) {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private sleepWithJitter(attempt: number) {
    // Exponential backoff: 1s, 2s, 4s... + random jitter 0–500ms
    const base = Math.min(1000 * Math.pow(2, attempt), 8000);
    const jitter = Math.random() * 500;
    return this.sleep(base + jitter);
  }
}

// ── Singleton export ──────────────────────────────────────────────────────
export const api = new ApiClient(env.API_BASE_URL);
