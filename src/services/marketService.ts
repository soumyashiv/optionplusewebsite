/**
 * marketService.ts — Market data service layer.
 *
 * Transforms backend API responses into frontend-friendly shapes.
 */
import { getMarketSummary, getOptionChain, getIndices, getGlobalPulse } from '../api/endpoints';
import type { MarketSummary, OptionChainResponse, IndexEntry, GlobalIndex } from '../types/api';

export { getMarketSummary, getOptionChain, getIndices, getGlobalPulse };
export type { MarketSummary, OptionChainResponse, IndexEntry, GlobalIndex };

/**
 * Fetch market summaries for multiple symbols in parallel.
 */
export async function fetchAllMarketSummaries(symbols: string[] = ['NIFTY', 'BANKNIFTY']): Promise<Record<string, MarketSummary>> {
  const results: Record<string, MarketSummary> = {};
  const settled = await Promise.allSettled(symbols.map(sym => getMarketSummary(sym)));

  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      results[symbols[i]] = result.value;
    }
  });

  return results;
}

/**
 * Format index value for display (e.g. 22453.30 → "22,453.30")
 */
export function formatIndexValue(value: number): string {
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Format change with sign (e.g. 124.50 → "+124.50")
 */
export function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format percentage change (e.g. 0.56 → "+0.56%")
 */
export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
