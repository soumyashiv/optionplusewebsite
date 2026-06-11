/**
 * endpoints.ts — Type-safe API endpoint functions.
 *
 * Each function maps 1:1 to a FastAPI backend route.
 * All responses are typed via ../types/api.ts
 */
import { api } from './client';
import type {
  MarketSummary,
  OptionChainResponse,
  NewsResponse,
  VelocityResponse,
  PcrHistoryResponse,
  WatchlistEntry,
  WatchlistAddPayload,
  GreeksResponse,
  FiiDiiEntry,
  GlobalIndex,
  IndexEntry,
  StrikeDetail,
  HealthResponse,
  StatusResponse,
  MarketSession,
  SessionRecord,
  SubscriptionStatus,
  AnalyticsResult,
  SessionsListResponse,
  PlanDefinition,
} from '../types/api';

// ── Sessions & Timeframes ─────────────────────────────────────────────────

export function getCurrentSession(symbol: string = 'NIFTY') {
  return api.get<MarketSession | null>(`/api/v1/sessions/current/${encodeURIComponent(symbol)}`);
}

export function getSessions(symbol?: string) {
  const qs = symbol ? `?symbol=${encodeURIComponent(symbol)}` : '';
  return api.get<SessionsListResponse>(`/api/v1/sessions${qs}`);
}

export function getSessionRecords(
  sessionId: string,
  interval: string = 'realtime',
  page: number = 1,
  pageSize: number = 25,
) {
  const params = new URLSearchParams({
    interval,
    page: String(page),
    page_size: String(pageSize),
  });
  return api.get<{ data: SessionRecord[], total: number, page: number, total_pages: number }>(
    `/api/v1/sessions/${encodeURIComponent(sessionId)}/data?${params.toString()}`
  );
}

// ── Market Data ───────────────────────────────────────────────────────────

export function getMarketSummary(index: string = 'NIFTY') {
  return api.get<MarketSummary>(`/api/v1/market-summary?index=${encodeURIComponent(index)}`);
}

export function getOptionChain(symbol: string, expiry?: string) {
  const params = new URLSearchParams();
  if (expiry) params.set('expiry', expiry);
  const qs = params.toString();
  return api.get<OptionChainResponse>(`/api/v1/option-chain/${encodeURIComponent(symbol)}${qs ? `?${qs}` : ''}`);
}

export function getVelocity(symbol: string, period: string = '1M') {
  return api.get<VelocityResponse>(`/api/v1/velocity/${encodeURIComponent(symbol)}?period=${encodeURIComponent(period)}`);
}

export function getStrike(symbol: string, strike: number) {
  return api.get<StrikeDetail>(`/api/v1/strike/${encodeURIComponent(symbol)}/${strike}`);
}

export function getGreeks(symbol: string) {
  return api.get<GreeksResponse>(`/api/v1/greeks/${encodeURIComponent(symbol)}`);
}

export function getPcrHistory(symbol: string, limit: number = 100) {
  return api.get<PcrHistoryResponse>(`/api/v1/pcr-history/${encodeURIComponent(symbol)}?limit=${limit}`);
}

// ── Analytics Engine (Backend-computed) ──────────────────────────────────

export function getAnalytics(symbol: string) {
  return api.get<AnalyticsResult>(`/api/v1/analytics/${encodeURIComponent(symbol)}`);
}

export function getHistoricalAnalytics(symbol: string, interval: '5m' | '15m' | '30m' | '1h' = '5m', limit = 50) {
  return api.get<{ symbol: string; interval: string; data: unknown[] }>(
    `/api/v1/analytics/historical/${encodeURIComponent(symbol)}?interval=${interval}&limit=${limit}`
  );
}


// ── Plans (public) ────────────────────────────────────────────────────────

export function getPlans() {
  return api.get<PlanDefinition[]>('/api/v1/plans', { skipAuth: true });
}

// ── Indices ───────────────────────────────────────────────────────────────

export function getIndices() {
  return api.get<IndexEntry[]>('/api/v1/indices');
}

export function getGlobalPulse() {
  return api.get<GlobalIndex[]>('/api/v1/global-pulse');
}

// ── News ──────────────────────────────────────────────────────────────────

export function getNews(sentiment?: string, limit: number = 20) {
  const params = new URLSearchParams();
  if (sentiment && sentiment !== 'all') params.set('sentiment', sentiment);
  if (limit !== 20) params.set('limit', String(limit));
  const qs = params.toString();
  return api.get<NewsResponse>(`/api/v1/news${qs ? `?${qs}` : ''}`);
}

// ── Watchlist ─────────────────────────────────────────────────────────────

export function getWatchlist() {
  return api.get<WatchlistEntry[]>('/api/v1/watchlist');
}

export function addToWatchlist(payload: WatchlistAddPayload) {
  return api.post<WatchlistEntry>('/api/v1/watchlist', payload);
}

export function removeFromWatchlist(itemId: string) {
  return api.delete<void>(`/api/v1/watchlist/${encodeURIComponent(itemId)}`);
}

// ── Institutional Data ────────────────────────────────────────────────────

export function getFiiDii() {
  return api.get<FiiDiiEntry[]>('/api/v1/fii-dii');
}

// ── Subscription & Billing ────────────────────────────────────────────────

export function getSubscriptionStatus() {
  return api.get<SubscriptionStatus>('/api/subscription/status');
}


// ── System ────────────────────────────────────────────────────────────────

export function healthCheck() {
  return api.get<HealthResponse>('/health', { skipAuth: true, retries: 1, timeout: 5000 });
}

export function getStatus() {
  return api.get<StatusResponse>('/api/v1/status');
}
