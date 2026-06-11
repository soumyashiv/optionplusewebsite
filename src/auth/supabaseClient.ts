/**
 * supabaseClient.ts — Singleton Supabase client for the frontend.
 *
 * Uses the ANON (public) key — safe to expose in browser code.
 * The service_role key must NEVER be used in the frontend.
 */
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn('[supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Auth will not work.');
}

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);
