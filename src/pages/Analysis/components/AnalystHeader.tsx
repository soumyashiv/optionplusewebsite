import { useState, useEffect } from 'react';
import type { AnalystData } from '../../../hooks/useAnalyst';

interface AnalystHeaderProps {
  data: AnalystData | null;
  historyLength: number;
  wsState: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastUpdated: Date | null;
  error: string | null;
  /** Real max-pain strike from backendAnalytics or snapshot calculation */
  maxPain?: number | null;
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

export function AnalystHeader({ data, wsState, lastUpdated, error, maxPain }: AnalystHeaderProps) {
  const spotDisplay = data ? data.spot.toLocaleString('en-IN') : '—';
  const relativeTime = useRelativeTime(lastUpdated);
  const status = WS_STATUS_CONFIG[wsState];

  // Prefer backend max_pain; fall back to '—' if not yet computed
  const maxPainDisplay = maxPain ? maxPain.toLocaleString('en-IN') : '—';

  return (
    <header className="px-gutter py-md lg:px-margin-desktop lg:py-lg flex flex-col md:flex-row justify-between items-start md:items-end border-b border-outline-variant/20 bg-surface/50 backdrop-blur-sm z-10 sticky top-0">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-xs">F&amp;O Analysis</h2>
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
      <div className="flex gap-sm mt-md md:mt-0">
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
