/**
 * authStore.ts — Zustand store for Supabase authentication.
 *
 * Replaces the simple boolean `isAuthenticated` with real session management.
 * Handles:
 *   - Email/password sign in and sign up
 *   - Google and Apple OAuth
 *   - Session persistence and auto-refresh
 *   - Token expiry handling
 */
import { create } from 'zustand';
import { supabase } from './supabaseClient';
import { api } from '../api/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  /** Initialize auth state — call once on app mount */
  initialize: () => Promise<void>;
  /** Email/password sign in */
  signIn: (email: string, password: string) => Promise<boolean>;
  /** Email/password sign up */
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  /** OAuth sign in (Google, Apple) */
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  /** Update user profile */
  updateProfile: (name: string) => Promise<boolean>;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
}

function formatAuthError(error: AuthError): string {
  // Map Supabase error messages to user-friendly text
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Invalid email or password.';
  if (msg.includes('email not confirmed')) return 'Please verify your email address.';
  if (msg.includes('user already registered')) return 'An account with this email already exists.';
  if (msg.includes('password')) return 'Password must be at least 6 characters.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please try again later.';
  if (msg.includes('network')) return 'Network error. Please check your connection.';
  return error.message;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true, // Start true — we're checking session on mount
  error: null,

  initialize: async () => {
    try {
      // Check for existing session
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      set({
        user: session?.user ?? null,
        session,
        isAuthenticated: !!session,
        isLoading: false,
      });

      // Listen for auth state changes (token refresh, sign out, etc.)
      supabase.auth.onAuthStateChange((event, session) => {
        set({
          user: session?.user ?? null,
          session,
          isAuthenticated: !!session,
        });

        // Initialize trial if they just signed in
        if (event === 'SIGNED_IN' && session) {
          api.post('/api/auth/init-trial', {}).catch((err) => {
            console.error('Failed to init trial:', err);
          });
        }
      });
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        set({ isLoading: false, error: formatAuthError(error) });
        return false;
      }
      set({
        user: data.user,
        session: data.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signUp: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || '' },
        },
      });
      if (error) {
        set({ isLoading: false, error: formatAuthError(error) });
        return false;
      }

      // Supabase may require email confirmation
      if (data.user && !data.session) {
        set({
          isLoading: false,
          error: null,
        });
        // User created but needs email verification
        return true;
      }

      set({
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.session,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signInWithOAuth: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) {
        set({ isLoading: false, error: formatAuthError(error) });
      }
      // OAuth redirects — loading will resolve when user returns
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'OAuth sign in failed';
      set({ isLoading: false, error: message });
    }
  },

  updateProfile: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: name }
      });
      if (error) {
        set({ isLoading: false, error: formatAuthError(error) });
        return false;
      }
      if (data.user) {
        set({ user: data.user, isLoading: false, error: null });
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      set({ isLoading: false, error: message });
      return false;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await supabase.auth.signOut();
    } catch {
      // Sign out even if API call fails
    }
    set({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => set({ error: null }),
}));
