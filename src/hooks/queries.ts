import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {

  getMarketSummary,
  getOptionChain,
  getVelocity,
  getPcrHistory,
  getIndices,
  getGlobalPulse,
  getNews,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getFiiDii,
  getSubscriptionStatus,
  getAnalytics,
  getHistoricalAnalytics,
  getSessions,
  getSessionRecords,
  getCurrentSession,
  getPlans,
} from '../api/endpoints';
import type { WatchlistAddPayload } from '../types/api';

// ── Cache TTLs (milliseconds) ────────────────────────────────────────────
const TTL = {
  MARKET:       2  * 60 * 1000,   // 2 min — matches new 2-min poll
  PCR:          2  * 60 * 1000,   // 2 min
  SIGNALS:      2  * 60 * 1000,   // 2 min
  ANALYTICS:    2  * 60 * 1000,   // 2 min
  NEWS:         5  * 60 * 1000,   // 5 min
  INDICES:      2  * 60 * 1000,   // 2 min
  WATCHLIST:    1  * 60 * 1000,   // 1 min
  PROFILE:      30 * 60 * 1000,   // 30 min
  SUBSCRIPTION: 30 * 60 * 1000,   // 30 min
  SESSIONS:     2  * 60 * 1000,   // 2 min — synced with worker
  FIIDII:       15 * 60 * 1000,   // 15 min
  GLOBAL:       5  * 60 * 1000,   // 5 min
  PLANS:        60 * 60 * 1000,   // 1 hour (static)
  HISTORICAL:   5  * 60 * 1000,   // 5 min (Supabase historical)
};

// ── Query Keys ────────────────────────────────────────────────────────────
export const queryKeys = {
  marketSummary:    (symbol: string)                    => ['marketSummary', symbol]              as const,
  optionChain:      (symbol: string, expiry?: string)   => ['optionChain', symbol, expiry]        as const,
  velocity:         (symbol: string, period: string)    => ['velocity', symbol, period]            as const,
  strike:           (symbol: string, strike: number)    => ['strike', symbol, strike]              as const,
  greeks:           (symbol: string)                    => ['greeks', symbol]                      as const,
  pcrHistory:       (symbol: string, limit: number)     => ['pcrHistory', symbol, limit]           as const,
  analytics:        (symbol: string)                    => ['analytics', symbol]                   as const,
  indices:          ()                                  => ['indices']                             as const,
  globalPulse:      ()                                  => ['globalPulse']                        as const,
  news:             (sentiment?: string, limit?: number)=> ['news', sentiment, limit]              as const,
  watchlist:        ()                                  => ['watchlist']                           as const,
  fiiDii:           ()                                  => ['fiiDii']                              as const,
  subscription:     ()                                  => ['subscription']                        as const,
  sessions:         (symbol?: string)                   => ['sessions', symbol]                    as const,
  sessionRecords:   (sessionId: string, interval: string, page: number) =>
                                                           ['sessionRecords', sessionId, interval, page] as const,
  currentSession:   (symbol: string)                    => ['currentSession', symbol]              as const,
  plans:            ()                                  => ['plans']                               as const,
};

// ── Market Hooks ─────────────────────────────────────────────────────────

export function useMarketSummaryQuery(symbol: string) {
  return useQuery({
    queryKey:   queryKeys.marketSummary(symbol),
    queryFn:    () => getMarketSummary(symbol),
    staleTime:  TTL.MARKET,
    gcTime:     TTL.MARKET * 2,
    refetchOnWindowFocus: false,
  });
}

export function useOptionChainQuery(symbol: string, expiry?: string) {
  return useQuery({
    queryKey:   queryKeys.optionChain(symbol, expiry),
    queryFn:    () => getOptionChain(symbol, expiry),
    staleTime:  TTL.MARKET,
    gcTime:     TTL.MARKET * 2,
    refetchOnWindowFocus: false,
  });
}

export function useVelocityQuery(symbol: string, period: string = '1M') {
  return useQuery({
    queryKey:   queryKeys.velocity(symbol, period),
    queryFn:    () => getVelocity(symbol, period),
    staleTime:  TTL.MARKET,
    gcTime:     TTL.MARKET * 2,
    refetchOnWindowFocus: false,
  });
}

export function usePcrHistoryQuery(symbol: string, limit: number = 100) {
  return useQuery({
    queryKey:   queryKeys.pcrHistory(symbol, limit),
    queryFn:    () => getPcrHistory(symbol, limit),
    staleTime:  TTL.PCR,
    gcTime:     TTL.PCR * 2,
    refetchOnWindowFocus: false,
  });
}

export function useAnalyticsQuery(symbol: string) {
  return useQuery({
    queryKey:   queryKeys.analytics(symbol),
    queryFn:    () => getAnalytics(symbol),
    staleTime:  TTL.ANALYTICS,
    gcTime:     TTL.ANALYTICS * 2,
    refetchOnWindowFocus: false,
  });
}

export function useIndicesQuery() {
  return useQuery({
    queryKey:   queryKeys.indices(),
    queryFn:    () => getIndices(),
    staleTime:  TTL.INDICES,
    gcTime:     TTL.INDICES * 2,
    refetchOnWindowFocus: false,
  });
}

export function useGlobalPulseQuery() {
  return useQuery({
    queryKey:   queryKeys.globalPulse(),
    queryFn:    () => getGlobalPulse(),
    staleTime:  TTL.GLOBAL,
    gcTime:     TTL.GLOBAL * 2,
    refetchOnWindowFocus: false,
  });
}

// ── News Hooks ────────────────────────────────────────────────────────────

export function useNewsQuery(sentiment?: string, limit: number = 20) {
  return useQuery({
    queryKey:   queryKeys.news(sentiment, limit),
    queryFn:    () => getNews(sentiment, limit),
    staleTime:  TTL.NEWS,
    gcTime:     TTL.NEWS * 2,
    refetchOnWindowFocus: false,
  });
}

// ── Watchlist Hooks ───────────────────────────────────────────────────────

export function useWatchlistQuery() {
  return useQuery({
    queryKey:   queryKeys.watchlist(),
    queryFn:    () => getWatchlist(),
    staleTime:  TTL.WATCHLIST,
    gcTime:     TTL.WATCHLIST * 2,
    refetchOnWindowFocus: false,
  });
}

export function useWatchlistMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (payload: WatchlistAddPayload) => addToWatchlist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist() });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeFromWatchlist(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.watchlist() });
    },
  });

  return { addMutation, removeMutation };
}

// ── Institutional Hooks ───────────────────────────────────────────────────

export function useFiiDiiQuery() {
  return useQuery({
    queryKey:   queryKeys.fiiDii(),
    queryFn:    () => getFiiDii(),
    staleTime:  TTL.FIIDII,
    gcTime:     TTL.FIIDII * 2,
    refetchOnWindowFocus: false,
  });
}

// ── Subscription Hooks ────────────────────────────────────────────────────

export function useSubscriptionQuery() {
  return useQuery({
    queryKey:   queryKeys.subscription(),
    queryFn:    () => getSubscriptionStatus(),
    staleTime:  TTL.SUBSCRIPTION,
    gcTime:     TTL.SUBSCRIPTION * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function usePlansQuery() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: () => getPlans(),
    staleTime: Infinity,
  });
}

// ── Session Hooks ─────────────────────────────────────────────────────────

export function useCurrentSessionQuery(symbol: string) {
  return useQuery({
    queryKey:        queryKeys.currentSession(symbol),
    queryFn:         () => getCurrentSession(symbol),
    staleTime:       TTL.SESSIONS,
    gcTime:          TTL.SESSIONS * 5,
    refetchInterval: 120_000,  // 2-min sync with worker
    refetchOnWindowFocus: false,
  });
}

export function useSessionRecordsQuery(
  sessionId: string | undefined,
  interval: string = 'realtime',
  page: number = 1,
  pageSize: number = 25,
) {
  return useQuery({
    queryKey:        queryKeys.sessionRecords(sessionId ?? '', interval, page),
    queryFn:         () => getSessionRecords(sessionId!, interval, page, pageSize),
    enabled:         !!sessionId,
    staleTime:       TTL.SESSIONS,
    gcTime:          TTL.SESSIONS * 5,
    refetchInterval: 120_000,  // 2-min sync with worker
    refetchOnWindowFocus: false,
  });
}

export function useHistoricalAnalyticsQuery(
  symbol: string,
  interval: '5m' | '15m' | '30m' | '1h' = '5m',
  limit = 50,
) {
  return useQuery({
    queryKey:   ['historicalAnalytics', symbol, interval],
    queryFn:    () => getHistoricalAnalytics(symbol, interval, limit),
    enabled:    !!symbol,
    staleTime:  TTL.HISTORICAL,
    gcTime:     TTL.HISTORICAL * 3,
    refetchOnWindowFocus: false,
  });
}

export function useSessionsListQuery(symbol?: string) {
  return useQuery({
    queryKey:   queryKeys.sessions(symbol),
    queryFn:    () => getSessions(symbol),
    staleTime:  TTL.SESSIONS,
    gcTime:     TTL.SESSIONS * 5,
    refetchOnWindowFocus: false,
  });
}
