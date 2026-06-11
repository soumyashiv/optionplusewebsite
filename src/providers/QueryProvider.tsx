import { QueryClient, QueryClientProvider as Provider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Centralized React Query client with optimized default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute: data is considered fresh, no background refetch
      gcTime: 5 * 60 * 1000, // 5 minutes: inactive data remains in cache
      refetchOnWindowFocus: false, // Prevent spamming backend when switching tabs
      retry: 1, // Only retry once on failure
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <Provider client={queryClient}>{children}</Provider>;
}
