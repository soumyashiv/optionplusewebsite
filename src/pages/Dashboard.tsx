import { useNavigate } from 'react-router-dom';

import { useMarketSummaryQuery, useIndicesQuery, useNewsQuery } from '../hooks/queries';
import { useMarketStore } from '../store/useMarketStore';
import { formatIndexValue, formatChange, formatPct } from '../services/marketService';
import { formatNewsTime, sentimentColor } from '../services/newsService';

// Loading skeleton
const SkeletonCard = () => (
  <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md animate-pulse">
    <div className="h-3 w-16 bg-outline-variant/20 rounded mb-sm"></div>
    <div className="h-6 w-28 bg-outline-variant/20 rounded"></div>
  </div>
);

export function Dashboard() {
  const navigate = useNavigate();
  const { symbol, timeframe, setTimeframe } = useMarketStore();

  const { data: summary, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useMarketSummaryQuery(symbol);
  const { data: indices = [], isLoading: indicesLoading } = useIndicesQuery();
  const { data: newsData, isLoading: newsLoading } = useNewsQuery(undefined, 5);
  const news = newsData?.items || [];

  const marketLoading = summaryLoading || indicesLoading;
  const marketError = summaryError ? (summaryError as Error).message : null;



  return (
    <main className="flex-1 overflow-y-auto p-md lg:p-gutter">
      <div className="max-w-screen-2xl mx-auto space-y-gutter">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mb-unit">
              Market Overview
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Live institutional data feed and portfolio performance.
            </p>
          </div>
          <div className="flex gap-sm">
            <button
              onClick={() => setTimeframe('1D')}
              className={`${timeframe === '1D' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              1D
            </button>
            <button
              onClick={() => setTimeframe('1W')}
              className={`${timeframe === '1W' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              1W
            </button>
            <button
              onClick={() => setTimeframe('1M')}
              className={`${timeframe === '1M' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              1M
            </button>
          </div>
        </div>

        {/* Error State */}
        {marketError && (
          <div className="bg-error/10 border border-error/20 rounded-xl p-lg flex items-center justify-between">
            <div className="flex items-center gap-sm text-error">
              <span className="material-symbols-outlined">error</span>
              <span className="font-body-md">{marketError}</span>
            </div>
            <button onClick={() => refetchSummary()} className="bg-error text-on-error font-label-md px-md py-xs rounded-full hover:opacity-90 transition-opacity">
              Retry
            </button>
          </div>
        )}

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Hero Chart Area (Spans 8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant/30 rounded-xl p-lg flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Global Indices Performance</h2>
              <button onClick={() => navigate('/dashboard/analysis')} className="text-primary font-label-md text-label-md hover:underline">Full Report</button>
            </div>
            {/* Live Indices Grid inside hero */}
            <div className="grid grid-cols-2 gap-sm mb-md">
              {marketLoading ? (
                <>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </>
              ) : indices.length > 0 ? (
                indices.map((idx) => (
                  <div key={idx.name} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md flex flex-col justify-between">
                    <span className="font-label-md text-label-md text-on-surface-variant mb-sm">{idx.name}</span>
                    <div className="flex items-end justify-between">
                      <span className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">{formatIndexValue(idx.value)}</span>
                      <div className={`font-label-sm text-label-sm flex flex-col items-end ${idx.up ? 'text-primary' : 'text-error'}`}>
                        <span>{formatChange(idx.change)}</span>
                        <span>{formatPct(idx.change_pct)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback: use summary spot price
                summary ? (
                  <div className="col-span-2 bg-surface-container-low border border-outline-variant/30 rounded-xl p-md">
                    <span className="font-label-md text-on-surface-variant">{summary.index_name}</span>
                    <span className="font-headline-md font-bold text-on-surface ml-md tabular-nums">{formatIndexValue(summary.spot_price)}</span>
                  </div>
                ) : null
              )}
            </div>
            {/* Chart Placeholder Area */}
            {/* NOTE: This chart area is a static CSS placeholder for future charting integrations. */}
            <div className="flex-1 bg-surface-container-lowest border border-outline-variant/10 rounded-lg relative overflow-hidden flex items-end p-md">
              <div className="absolute inset-0 bg-gradient-to-t from-secondary-container/20 to-transparent pointer-events-none"></div>
              <div className="w-full flex justify-between items-end h-full gap-unit z-10 opacity-70">
                <div className="w-1/12 bg-primary/20 h-1/4 rounded-t-sm"></div>
                <div className="w-1/12 bg-primary/40 h-1/3 rounded-t-sm"></div>
                <div className="w-1/12 bg-error/30 h-1/5 rounded-t-sm"></div>
                <div className="w-1/12 bg-primary/60 h-1/2 rounded-t-sm"></div>
                <div className="w-1/12 bg-primary h-3/4 rounded-t-sm"></div>
                <div className="w-1/12 bg-error/50 h-2/3 rounded-t-sm"></div>
                <div className="w-1/12 bg-primary-container h-full rounded-t-sm"></div>
              </div>
            </div>
          </div>

          {/* Market Insights Summary (Spans 4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-gutter h-[400px]">
            <div className="bg-surface border border-outline-variant/30 rounded-xl p-lg flex-1 flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Market Insights</h3>
              {marketLoading ? (
                <div className="animate-pulse space-y-sm flex-1">
                  <div className="h-3 bg-outline-variant/20 rounded w-full"></div>
                  <div className="h-3 bg-outline-variant/20 rounded w-5/6"></div>
                  <div className="h-3 bg-outline-variant/20 rounded w-4/6"></div>
                </div>
              ) : summary ? (
                <>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-1">
                    {summary.insight || 'Volatility indexes show a sharp decline leading into Q3, suggesting stabilization in tech sectors.'}
                  </p>
                  <div className="flex items-center gap-sm text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider text-white ${summary.market_direction === 'BULLISH' ? 'bg-primary' : summary.market_direction === 'BEARISH' ? 'bg-error' : 'bg-[#534AB7]'}`}>
                      {summary.market_direction}
                    </span>
                    <span className="text-on-surface-variant">PCR: {summary.pcr.toFixed(2)}</span>
                    <span className="text-on-surface-variant">ATM: {summary.atm_strike}</span>
                  </div>
                </>
              ) : (
                <p className="font-body-md text-body-md text-on-surface-variant flex-1">
                  Volatility indexes show a sharp decline leading into Q3, suggesting stabilization in tech sectors. Recommended holding pattern for primary equities.
                </p>
              )}
            </div>
          </div>

          {/* Active Options Table (Spans 8 cols) */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant/30 rounded-xl p-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-md">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Active Options Chain</h2>
              <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary transition-colors">
                filter_list
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/30">
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Strike</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Call OI</th>
                    <th className="py-sm px-sm font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Put OI</th>
                  </tr>
                </thead>
                <tbody>
                  {marketLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline-variant/10 animate-pulse">
                        <td className="py-md px-sm"><div className="h-4 w-16 bg-outline-variant/20 rounded"></div></td>
                        <td className="py-md px-sm"><div className="h-4 w-16 bg-outline-variant/20 rounded"></div></td>
                        <td className="py-md px-sm"><div className="h-4 w-16 bg-outline-variant/20 rounded"></div></td>
                      </tr>
                    ))
                  ) : summary?.option_chain && summary.option_chain.length > 0 ? (
                    summary.option_chain.slice(0, 5).map((row, i) => (
                      <tr key={row.strike || i} className={`border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors ${i % 2 === 1 ? 'bg-secondary-container/5' : ''}`}>
                        <td className="py-md px-sm font-body-md text-body-md font-bold tabular-nums">{row.strike?.toLocaleString('en-IN')}</td>
                        <td className="py-md px-sm font-body-md text-body-md tabular-nums text-primary-container">{row.call_oi?.toLocaleString('en-IN')}</td>
                        <td className="py-md px-sm font-body-md text-body-md tabular-nums text-error">{row.put_oi?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-lg text-center text-on-surface-variant font-body-md">
                        No option chain data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live News Feed (Spans 4 cols) */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant/30 rounded-xl p-lg flex flex-col h-[300px] overflow-hidden">
            <div className="flex justify-between items-center mb-md sticky top-0 bg-surface z-10">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Live News Feed</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-sm space-y-md">
              {newsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-md animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-outline-variant/30 mt-2 flex-shrink-0"></div>
                    <div className="flex-1 space-y-sm">
                      <div className="h-2 w-16 bg-outline-variant/20 rounded"></div>
                      <div className="h-3 w-full bg-outline-variant/20 rounded"></div>
                    </div>
                  </div>
                ))
              ) : news.length > 0 ? (
                news.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex gap-md group cursor-pointer">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 group-hover:scale-150 transition-transform ${sentimentColor(item.sentiment).replace('text-', 'bg-')}`}></div>
                    <div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant mb-unit">
                        {formatNewsTime(item.published_at) || item.source || ''}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface group-hover:text-primary transition-colors">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex gap-md group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant mb-unit">Now</p>
                    <p className="font-body-md text-body-md text-on-surface">Market data loading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-xxl border-t border-outline-variant/10 py-lg flex flex-col md:flex-row justify-between items-center text-outline text-label-sm font-label-sm">
          <p>© 2024 OptionPluse Institutional. All Rights Reserved.</p>
          <div className="flex gap-md mt-sm md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-primary transition-colors" href="#">Regulatory Disclosures</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
