/**
 * api.ts — TypeScript types matching the FastAPI backend response schemas.
 *
 * Every type here mirrors a backend endpoint's response shape.
 * Keep in sync with backend/main.py when API contracts change.
 */

// ── Generic API Error ─────────────────────────────────────────────────────
export interface ApiError {
  status: number;
  error: string;
  detail?: string;
}

// ── Sessions & Timeframes ──────────────────────────────────────────────────
export interface MarketSession {
  id: string;
  date: string;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'closed' | 'archived';
  symbol: string;
  // Added by get_current_session RPC enrichment
  total_records?: number;
  first_fetch?: string | null;
  last_fetch?: string | null;
}

/**
 * SessionRecord mirrors the actual `session_market_data` table columns.
 * Do NOT use old fields: timestamp, spot_price, pcr, payload — those were from
 * the deprecated `market_session_records` table (supabase_schema.sql).
 */
export interface SessionRecord {
  id: number;
  session_id: string;
  symbol: string;
  strike: number;
  call_oi: number;
  call_coi: number;
  put_oi: number;
  put_coi: number;
  call_iv: number;
  put_iv: number;
  call_ltp: number;
  put_ltp: number;
  fetched_at: string;
  created_at: string;
}

export type TimeframeMode = 'Realtime' | '5m' | '15m' | '30m' | '1Hr' | '4Hr' | '1Day';

// ── /api/v1/market-summary ────────────────────────────────────────────────
export interface MarketSummary {
  timestamp: string;
  index_name: string;
  market_direction: string;
  insight: string;
  pcr: number;
  atm_strike: number;
  support: number;
  resistance: number;
  news_sentiment: string;
  top_news: NewsItem[];
  option_chain: OptionChainRow[];
  fetched_at: string;
  spot_price: number;
  expiry: string;
}

// ── /api/v1/option-chain/{symbol} ─────────────────────────────────────────
export interface OptionChainRow {
  strike: number;
  call_oi: number;
  call_coi: number;
  put_oi: number;
  put_coi: number;
  call_iv: number | null;
  put_iv: number | null;
  call_ltp: number | null;
  put_ltp: number | null;
  call_label?: string;
  put_label?: string;
  call_change_pct?: number;
  put_change_pct?: number;
  call_greeks?: Greeks;
  put_greeks?: Greeks;
}

export interface OptionChainResponse {
  symbol: string;
  data: OptionChainRow[];
  source: string;
}

// ── Greeks ────────────────────────────────────────────────────────────────
export interface Greeks {
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  iv: number | null;
}

export interface GreeksRow {
  strike: number;
  call_greeks: Greeks | null;
  put_greeks: Greeks | null;
}

export interface GreeksResponse {
  symbol: string;
  greeks: GreeksRow[];
  source: string;
}

// ── /api/v1/news ──────────────────────────────────────────────────────────
export interface NewsItem {
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  published_at?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  category?: string;
  image?: string;
}

export interface NewsResponse {
  items: NewsItem[];
  count: number;
}

// ── /api/v1/velocity/{symbol} ─────────────────────────────────────────────
export interface VelocityPoint {
  ts: string;
  value: number;
}

export interface VelocityResponse {
  symbol: string;
  period: string;
  points: VelocityPoint[];
}

// ── /api/v1/pcr-history/{symbol} ──────────────────────────────────────────
export interface PcrPoint {
  ts: string;
  pcr: number;
}

export interface PcrHistoryResponse {
  symbol: string;
  points: PcrPoint[];
  count: number;
}

// ── /api/v1/watchlist ─────────────────────────────────────────────────────
export interface WatchlistEntry {
  id: string;
  symbol: string;
  strike: number;
  option_type: 'CE' | 'PE';
  added_at: string;
  ltp: number | null;
  change: number | null;
  oi_label: string | null;
}

export interface WatchlistAddPayload {
  symbol: string;
  strike: number;
  option_type: 'CE' | 'PE';
}

// ── /api/v1/fii-dii ──────────────────────────────────────────────────────
export interface FiiDiiEntry {
  category: string;
  buy_value: number;
  sell_value: number;
  net_value: number;
  date?: string;
}

// ── /api/v1/global-pulse ──────────────────────────────────────────────────
export interface GlobalIndex {
  name: string;
  price: number;
  change_pct: number;
}

// ── /api/v1/indices ───────────────────────────────────────────────────────
export interface IndexEntry {
  name: string;
  value: number;
  change: number;
  change_pct: number;
  up: boolean;
}

// ── /api/v1/strike/{symbol}/{strike} ──────────────────────────────────────
export interface StrikeDetail {
  symbol: string;
  strike: number;
  data: {
    timestamp: string;
    call_oi: number;
    call_coi: number;
    put_oi: number;
    put_coi: number;
    call_ltp: number;
    put_ltp: number;
    call_iv: number;
    put_iv: number;
    volatility: number;
  };
  source: string;
}

// ── /health ───────────────────────────────────────────────────────────────
export interface HealthResponse {
  status: string;
  timestamp: string;
}

// ── /api/v1/status ────────────────────────────────────────────────────────
export interface StatusResponse {
  market_polls: Array<{
    symbol: string;
    cached: boolean;
    last_error: string | null;
    last_success: string | null;
  }>;
  news_cached: boolean;
  news_count: number;
  poll_interval_seconds: number;
  cache_backend: string;
  ws_clients_active: number;
  server_time: string;
}

// ── /api/subscription/status ──────────────────────────────────────────────
export interface SubscriptionStatus {
  has_access: boolean;
  plan_type: 'trial' | 'weekly' | 'monthly' | 'dev' | null;
  status: 'active' | 'expired' | 'cancelled' | 'none';
  trial_start_date: string | null;
  trial_end_date: string | null;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  days_remaining: number;
  hours_remaining: number;
  razorpay_customer_id: string | null;
  last_payment_date: string | null;
}

// ── /api/v1/analytics/{symbol} ───────────────────────────────────────────
export interface AnalyticsResult {
  symbol: string;
  timestamp: string;
  // Unified Algo (UA) — net directional pressure score
  ua: number | null;
  // Contrarian Algo (CA) — reversal signal score
  ca: number | null;
  // Composite Long/Short Exit signal (Clex)
  clex: number | null;
  // Max Pain strike price
  max_pain: number | null;
  // PCR from full chain
  pcr: number;
  // 7-Factor Algo composite score (-100 to +100)
  seven_factor: SevenFactorResult | null;
  // Trend strength (0–100)
  trend_strength: number | null;
  // Market bias
  market_bias: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
}

export interface SevenFactorResult {
  score: number;                    // composite -100 to +100
  label: 'Strong Bull' | 'Bull' | 'Neutral' | 'Bear' | 'Strong Bear';
  factors: {
    pcr_signal:          number;    // -1, 0, +1
    oi_buildup:          number;    // -1, 0, +1
    put_writing:         number;    // -1, 0, +1
    call_writing:        number;    // -1, 0, +1
    max_pain_distance:   number;    // -1, 0, +1
    atm_oi_ratio:        number;    // -1, 0, +1
    news_sentiment:      number;    // -1, 0, +1
  };
}

// ── /api/v1/plans ─────────────────────────────────────────────────────────
/**
 * Matches the `pricing_plans` table as returned by /api/v1/plans.
 * Keys match the TEXT PRIMARY KEY values: 'trial' | 'weekly' | 'monthly'
 */
export interface PlanDefinition {
  id: string;               // 'trial' | 'weekly' | 'monthly'
  display_label: string;    // e.g. 'Free Trial'
  display_price_usd: string; // e.g. '$0'
  duration_days: number;    // 3 | 7 | 30
  amount_inr_paise: number; // 0 | 75000 | 240000
  is_active?: boolean;
}

// ── /api/v1/sessions (list) ──────────────────────────────────────────────
export interface SessionsListResponse {
  sessions: MarketSession[];
  total: number;
}
