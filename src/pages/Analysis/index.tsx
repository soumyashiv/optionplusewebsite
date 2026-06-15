import { useState } from 'react';
import { useAnalyst } from '../../hooks/useAnalyst';
import { AnalystHeader } from './components/AnalystHeader';
import { AlgorithmGlimpse } from './components/AlgorithmGlimpse';
import { MetricGrid } from './components/MetricGrid';
import { AnalystTabs } from './components/AnalystTabs';
import { useMarketStore } from '../../store/useMarketStore';
import type { TimeframeMode } from '../../types/api';

const TIMEFRAMES: TimeframeMode[] = ['Realtime', '5m', '15m', '30m'];

export function Analysis() {
  const [timeframe, setTimeframe] = useState<TimeframeMode>('Realtime');
  const { symbol } = useMarketStore();
  const { data, history, pcrHistory, pcrHistoryLoading, glimpseData, wsState, lastUpdated, error, refresh } = useAnalyst(symbol, timeframe);
  
  const latestSnapshot = history.length > 0 ? history[0] : null;

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
      <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-md border-b border-outline-variant/20">
        <AnalystHeader 
          data={data} 
          historyLength={history.length} 
          wsState={timeframe === 'Realtime' ? wsState : ('connected' as const)} 
          lastUpdated={lastUpdated}
          error={error}
          maxPain={glimpseData?.backendAnalytics?.max_pain ?? latestSnapshot?.mpStrike ?? null}
          onRefresh={refresh}
        />
        
        {/* Timeframe Selector */}
        <div className="px-gutter lg:px-margin-desktop py-sm flex gap-sm overflow-x-auto no-scrollbar">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-1.5 rounded-full font-label-md transition-colors whitespace-nowrap
                ${timeframe === tf 
                  ? 'bg-primary text-on-primary shadow-sm' 
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'
                }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-gutter lg:px-margin-desktop py-lg space-y-xl">
        <AlgorithmGlimpse glimpseData={glimpseData} />
        
        {data && <MetricGrid data={data} latestSnapshot={latestSnapshot} />}

        <AnalystTabs 
          data={data} 
          history={history}
          pcrHistory={pcrHistory}
          pcrHistoryLoading={pcrHistoryLoading}
          glimpseData={glimpseData}
        />

        {/* Bottom Spacer */}
        <div className="h-16"></div>
      </div>
    </main>
  );
}
