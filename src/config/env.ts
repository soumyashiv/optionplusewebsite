/**
 * env.ts — Centralized, type-safe environment configuration.
 *
 * All environment variables accessed through Vite must be prefixed with VITE_.
 * This module validates required vars at startup and exports typed constants.
 */

interface EnvConfig {
  /** Base URL for REST API calls (e.g. https://api.optionpluse.in) */
  API_BASE_URL: string;
  /** Base URL for WebSocket connections (e.g. wss://api.optionpluse.in) */
  WS_BASE_URL: string;
  /** Supabase project URL */
  SUPABASE_URL: string;
  /** Supabase anonymous/public key (safe to expose in frontend) */
  SUPABASE_ANON_KEY: string;
  /** App-level API key for unauthenticated requests */
  APP_API_KEY: string;
  /** Whether we're running in production */
  IS_PRODUCTION: boolean;
}

function getEnv(): EnvConfig {
  const mode = import.meta.env.MODE;
  const isProd = mode === 'production';

  // In development, use sensible defaults; in production, require explicit values
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (isProd ? '' : 'http://localhost:8000');
  const wsBaseUrl = import.meta.env.VITE_WS_BASE_URL || (isProd ? '' : 'ws://localhost:8000');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  const appApiKey = import.meta.env.VITE_APP_API_KEY || '';

  // Validate critical vars in production
  if (isProd) {
    const missing: string[] = [];
    if (!apiBaseUrl) missing.push('VITE_API_BASE_URL');
    if (!wsBaseUrl) missing.push('VITE_WS_BASE_URL');
    if (!supabaseUrl) missing.push('VITE_SUPABASE_URL');
    if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY');
    if (missing.length > 0) {
      console.error(`[env] Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  return {
    API_BASE_URL: apiBaseUrl.replace(/\/$/, ''), // Strip trailing slash
    WS_BASE_URL: wsBaseUrl.replace(/\/$/, ''),
    SUPABASE_URL: supabaseUrl,
    SUPABASE_ANON_KEY: supabaseAnonKey,
    APP_API_KEY: appApiKey,
    IS_PRODUCTION: isProd,
  };
}

export const env = getEnv();
