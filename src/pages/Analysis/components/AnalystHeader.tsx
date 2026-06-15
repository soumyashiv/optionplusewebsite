import { useState, useEffect, memo } from 'react';
import type { AnalystData } from '../../../hooks/useAnalyst';

interface AnalystHeaderProps {
  data: AnalystData | null;
  historyLength: number;
  wsState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdated: Date | null;
  error: string | null;
  expiry?: string;
  /** Real max-pain strike from backendAnalytics or snapshot calculation */
  maxPain?: number | null;
  onRefresh?: () => void;
}

/** Returns a human-readable "X seconds ago" string, auto-updating every second. */
function useRelativeTime(date: Date | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!date) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [date]);

  if (!date) return '—';
  const diffMs = now - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 5) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

const WS_STATUS_CONFIG = {
  connected: { dot: 'bg-green-500 animate-pulse', label: 'Live', color: 'text-green-600' },
  connecting: { dot: 'bg-yellow-500 animate-pulse', label: 'Connecting...', color: 'text-yellow-600' },
  disconnected: { dot: 'bg-gray-400', label: 'Offline', color: 'text-on-surface-variant' },
  error: { dot: 'bg-red-500', label: 'Error', color: 'text-red-600' },
} as const;

export const AnalystHeader = memo(function AnalystHeader({ data, wsState, lastUpdated, error, expiry, maxPain, onRefresh }: AnalystHeaderProps) {
  const spotDisplay = data ? data.spot.toLocaleString('en-IN') : '—';
  const relativeTime = useRelativeTime(lastUpdated);
  const status = WS_STATUS_CONFIG[wsState];

  // Prefer backend max_pain; fall back to '—' if not yet computed
  const maxPainDisplay = maxPain ? maxPain.toLocaleString('en-IN') : '—';

  return (
    <header className="px-gutter py-md lg:px-margin-desktop lg:py-lg flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 bg-surface/50 backdrop-blur-sm z-10 sticky top-0">
      <div>
        <div className="flex items-center gap-sm mb-xs">
          <h2 className="font-headline-md text-headline-md text-on-surface">F&amp;O Analysis</h2>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="p-1.5 rounded-full hover:bg-surface-variant text-on-surface-variant transition-colors"
              title="Refresh Data"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-md font-body-sm text-on-surface-variant flex-wrap">
          {/* Connection Status */}
          <div className="flex items-center gap-xs">
            <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
            <span className={status.color}>{status.label}</span>
          </div>
          <span className="text-outline">|</span>
          {/* Last Updated */}
          <span title={lastUpdated ? lastUpdated.toLocaleTimeString() : ''}>
            {relativeTime}
          </span>
          {/* Error indicator */}
          {error && wsState === 'error' && (
            <>
              <span className="text-outline">|</span>
              <span className="text-red-500 text-xs truncate max-w-[200px]" title={error}>
                {error}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-sm mt-md md:mt-0 flex-wrap">
        {/* Expiry Badge */}
        {expiry && (
          <div className="bg-indigo-50 border border-indigo-200/60 px-md py-sm rounded-lg flex flex-col justify-center">
            <span className="font-label-sm text-label-sm text-indigo-700 uppercase tracking-wider mb-xs">Expiry</span>
            <span className="font-headline-sm text-headline-sm font-bold text-indigo-900">{expiry}</span>
          </div>
        )}
        <div className="bg-surface-container-highest px-md py-sm rounded-lg border border-outline-variant/30 flex flex-col justify-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Spot (NIFTY)</span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{spotDisplay}</span>
        </div>
        <div className="bg-surface-container px-md py-sm rounded-lg border border-outline-variant/30 flex flex-col justify-center">
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Max Pain</span>
          <span className="font-headline-sm text-headline-sm font-bold text-on-surface">{maxPainDisplay}</span>
        </div>
      </div>
    </header>
  );
}
