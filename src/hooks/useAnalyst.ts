import { useState, useEffect, useMemo } from 'react';
import type { OptionMap } from '../utils/analystAlgorithms';
import { computeMaxPain, computeUA, computeCA, computeClex } from '../utils/analystAlgorithms';
import { useMarketSummaryQuery, usePcrHistoryQuery, useAnalyticsQuery } from './queries';
import { getCurrentSession, getSessionRecords } from '../api/endpoints';
import type { TimeframeMode } from '../types/api';

export interface Snapshot {
  ts: string;
  spot: number;
  atmSP: number;
  pcrOI: number;
  pcrCOI: number;
  mpStrike: number;
  vis: number[];
  map: OptionMap;
}

export interface AnalystData {
  spot: number;
  atmSP: number;
  ts: string;
  expiry: string;
  map: OptionMap;
  vis: number[];
  allStrikes: number[];
  pcrOI: number;
  pcrCOI: number;
  tCeOI: number;
  tPeOI: number;
  tCeCOI: number;
  tPeCOI: number;
}

export interface PcrHistoryPoint {
  ts: string;
  pcr: number;
}

// Helper to parse the raw API summary object into AnalystData & Snapshot
function parseMarketSummary(summaryRaw: unknown): { parsedData: AnalystData; snap: Snapshot } {
  const summary = summaryRaw as {
    option_chain: {
      strike: number;
      call_oi?: number; call_coi?: number;
      put_oi?: number; put_coi?: number;
      call_ltp?: number; put_ltp?: number;
    }[];
    spot_price: number;
    atm_strike: number;
    timestamp: string;
    expiry: string;
  };

  const fullMap: OptionMap = {};
  const allStrikes: number[] = [];

  summary.option_chain.forEach((row) => {
    fullMap[row.strike] = {
      ceOI: row.call_oi || 0,
      ceCOI: row.call_coi || 0,
      peOI: row.put_oi || 0,
      peCOI: row.put_coi || 0,
      ceLTP: row.call_ltp || 0,
      peLTP: row.put_ltp || 0,
      ceVol: 0,
      peVol: 0
    };
    allStrikes.push(row.strike);
  });

  allStrikes.sort((a, b) => a - b);
  if (!allStrikes.length) throw new Error('No valid strike prices found.');

  const spot = summary.spot_price;
  const atmSP = summary.atm_strike;
  const ts = summary.timestamp;
  const expiry = summary.expiry;

  let atmIdx = allStrikes.indexOf(atmSP);
  if (atmIdx === -1) {
    atmIdx = allStrikes.reduce((prevIdx, curr, idx) =>
      Math.abs(curr - spot) < Math.abs(allStrikes[prevIdx] - spot) ? idx : prevIdx
      , 0);
  }

  const range = 5;
  const vis = allStrikes.slice(Math.max(0, atmIdx - range), Math.min(allStrikes.length - 1, atmIdx + range) + 1);

  let tCeOI = 0, tPeOI = 0, tCeCOI = 0, tPeCOI = 0;
  vis.forEach(sp => {
    tCeOI += fullMap[sp].ceOI;
    tPeOI += fullMap[sp].peOI;
    tCeCOI += fullMap[sp].ceCOI;
    tPeCOI += fullMap[sp].peCOI;
  });

  const pcrOI = tCeOI === 0 ? 0 : Number((tPeOI / tCeOI).toFixed(4));
  const pcrCOI = tCeCOI === 0 ? 0 : Number((tPeCOI / tCeCOI).toFixed(4));
  const mpResult = computeMaxPain(allStrikes, fullMap);
  const mpStrike = mpResult?.mpStrike || atmSP;

  const parsedData: AnalystData = {
    spot, atmSP, ts, expiry, map: fullMap, vis, allStrikes,
    pcrOI, pcrCOI, tCeOI, tPeOI, tCeCOI, tPeCOI
  };

  const snap: Snapshot = {
    ts, spot, atmSP, pcrOI, pcrCOI, mpStrike, vis, map: fullMap
  };

  return { parsedData, snap };
}


export function useAnalyst(symbol: string, timeframe: TimeframeMode) {
  // Use React Query for Market Summary (Realtime WS updates this via queryClient)
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useMarketSummaryQuery(symbol);

  // Pre-computed analytics from backend (MaxPain, UA, CA, Clex, 7-Factor)
  const { data: analyticsData } = useAnalyticsQuery(symbol);

  // PCR History from API
  const pcrLimit = timeframe === 'Realtime' ? 100 : 20;
  const { data: pcrHistoryRes, isLoading: pcrHistoryLoading } = usePcrHistoryQuery(symbol, pcrLimit);
  const pcrHistory = pcrHistoryRes?.points || [];

  const [history, setHistory] = useState<Snapshot[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Process Current Snapshot
  const parsed = useMemo(() => {
    if (!summaryData) return null;
    try {
      return parseMarketSummary(summaryData);
    } catch (err) {
      console.error('Parse Error:', err);
      return null;
    }
  }, [summaryData]);

  // 2. Handle Historical Timeframes vs Realtime
  useEffect(() => {
    let mounted = true;
    if (timeframe === 'Realtime') {
      // In realtime, just append the newest snap to history
      if (parsed?.snap) {
        setHistory(prev => {
          if (prev.length > 0 && prev[0].ts === parsed.snap.ts) return prev;
          return [parsed.snap, ...prev].slice(0, 100);
        });
      }
      return;
    }

    // Otherwise, fetch historical sessions
    async function fetchHistorical() {
      try {
        const session = await getCurrentSession(symbol);
        if (!session?.id) throw new Error('No active market session found');

        let intervalParam = '15m';
        if (timeframe === '5m') intervalParam = '5m';
        else if (timeframe === '15m') intervalParam = '15m';
        else if (timeframe === '30m') intervalParam = '30m';
        else if (timeframe === '1Hr') intervalParam = '1h';
        else if (timeframe === '4Hr') intervalParam = '4h';
        else if (timeframe === '1Day') intervalParam = '1d';

        const response = await getSessionRecords(session.id, intervalParam);
        if (!mounted) return;

        // API returns { data: [...], total, page, total_pages }
        const recordsList = Array.isArray(response) ? response : (response?.data || []);
        
        // Group by fetched_at
        const grouped: Record<string, any> = {};
        for (const record of recordsList) {
          // Handle both old format (payload) and new format (flat row)
          if (record.payload) {
            const ts = record.payload.timestamp || record.fetched_at;
            if (!grouped[ts]) grouped[ts] = record.payload;
            continue;
          }
          
          const ts = record.fetched_at || record.timestamp;
          if (!ts) continue;
          
          if (!grouped[ts]) {
            grouped[ts] = {
              timestamp: ts,
              expiry: '',
              spot_price: 0,
              atm_strike: 0,
              option_chain: []
            };
          }
          grouped[ts].option_chain.push({
            strike: record.strike,
            call_oi: record.call_oi,
            call_coi: record.call_coi,
            put_oi: record.put_oi,
            put_coi: record.put_coi,
            call_ltp: record.call_ltp,
            put_ltp: record.put_ltp
          });
        }

        const parsedHistory: Snapshot[] = [];
        for (const ts in grouped) {
          const summary = grouped[ts];
          if (!summary.spot_price && summary.option_chain.length > 0) {
            // Reconstruct atm_strike & spot_price roughly by finding where call_ltp and put_ltp are closest
            let bestStrike = summary.option_chain[0].strike;
            let minDiff = Infinity;
            for (const r of summary.option_chain) {
              const diff = Math.abs((r.call_ltp || 0) - (r.put_ltp || 0));
              if (diff < minDiff && (r.call_ltp > 0 || r.put_ltp > 0)) {
                minDiff = diff;
                bestStrike = r.strike;
              }
            }
            summary.atm_strike = bestStrike;
            summary.spot_price = bestStrike;
          }
          try {
            parsedHistory.push(parseMarketSummary(summary).snap);
          } catch {
            // ignore malformed rows
          }
        }
        
        parsedHistory.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
        setHistory(parsedHistory);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load historical data');
      }
    }
    fetchHistorical();

    return () => { mounted = false; };
  }, [symbol, timeframe, parsed?.snap]);

  // ── Analytics: Backend is the primary source (Architecture Rule 9) ────────
  // glimpseData comes from the backend analytics endpoint.
  // While the backend is warming up (cold start), we derive a lightweight
  // fallback from the current snapshot so the UI never shows empty cards.
  const glimpseData = useMemo(() => {
    // 1. If backend has delivered analytics — use them exclusively
    if (analyticsData && !(analyticsData as any).source?.includes('fallback')) {
      const ad = analyticsData as any;
      
      // Convert backend scalar scores (0-100) to legacy objects for the UI
      const legacyMap = (val: any) => {
        if (typeof val !== 'number') return val ?? null;
        return {
          isBull: val >= 50,
          conf: val,
          conv: val, // clex uses conv
          entry: parsed?.parsedData?.spot ?? 0,
          sl: 0
        };
      };

      const uaObj = legacyMap(ad.ua);
      const caObj = legacyMap(ad.ca);
      const clexObj = legacyMap(ad.clex);
      
      const bullCount = [uaObj?.isBull, caObj?.isBull, clexObj?.isBull].filter(Boolean).length;
      const finalObj = ad.final ?? { 
        isBull: bullCount >= 2, 
        conv: Math.round(((uaObj?.conf||0) + (caObj?.conf||0) + (clexObj?.conv||0)) / 3) 
      };

      return {
        // Expose full backend payload for all algo tabs
        backendAnalytics: ad,
        // Derive lightweight fields from backend data for legacy consumers
        ua:    uaObj,
        ca:    caObj,
        clex:  clexObj,
        final: finalObj,
      };
    }

    // 2. Cold-start / Redis miss: derive from current snapshot as a temporary display
    if (parsed?.parsedData) {
      const { parsedData } = parsed;
      const algoInput = {
        spot:   parsedData.spot,
        atmSP:  parsedData.atmSP,
        vis:    parsedData.vis,
        map:    parsedData.map,
        pcrOI:  parsedData.pcrOI,
        pcrCOI: parsedData.pcrCOI,
      };
      const ua   = computeUA(algoInput);
      const ca   = computeCA(algoInput);
      const clex = computeClex(algoInput);
      const bullCount  = [ua.isBull, ca.isBull, clex.isBull].filter(Boolean).length;
      const finalBull  = bullCount >= 2;
      const finalConv  = Math.round((ua.conf + ca.conf + clex.conv) / 3);
      return {
        ua, ca, clex,
        final:           { isBull: finalBull, conv: finalConv },
        backendAnalytics: analyticsData ?? null,
        _isFallback:      true,   // flag so AlgoTab can show a "warming up" badge
      };
    }

    return null;
  }, [analyticsData, parsed]);

  // Clear errors when we switch timeframes
  useEffect(() => {
    if (summaryError) setError((summaryError as Error).message);
    else setError(null);
  }, [summaryError, timeframe]);

  return {
    data: parsed?.parsedData || null,
    history,
    pcrHistory,
    pcrHistoryLoading,
    glimpseData,
    wsState: 'connected' as const, // Handled by global wsManager now
    lastUpdated: summaryData ? new Date((summaryData as any).timestamp) : null,
    error,
    isLoading: summaryLoading,
  };
}
