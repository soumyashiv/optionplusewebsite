import { useState } from 'react';
import { useIndicesQuery } from '../hooks/queries';

export function Market() {
  const { data: indices = [] } = useIndicesQuery();
  const [activeTab, setActiveTab] = useState<'Equity' | 'Derivatives' | 'Commodities'>('Equity');
  const [moverTab, setMoverTab] = useState<'Gainers' | 'Losers'>('Gainers');

  const displayIndices = indices.length > 0 ? indices : [
    { name: 'NIFTY 50', value: 22453.30, change: 124.50, change_pct: 0.56, up: true },
    { name: 'BANKNIFTY', value: 47800.15, change: 342.20, change_pct: 0.72, up: true },
    { name: 'FINNIFTY', value: 21340.50, change: -45.10, change_pct: -0.21, up: false },
    { name: 'INDIA VIX', value: 14.20, change: -1.05, change_pct: -6.88, up: false },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-md lg:p-gutter">
      <div className="max-w-screen-2xl mx-auto space-y-gutter">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-surface mb-unit">
              Market Snapshot
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Broad market indices, sector performance, and top movers.
            </p>
          </div>
          <div className="flex gap-sm">
            <button 
              onClick={() => setActiveTab('Equity')}
              className={`${activeTab === 'Equity' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              Equity
            </button>
            <button 
              onClick={() => setActiveTab('Derivatives')}
              className={`${activeTab === 'Derivatives' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              Derivatives
            </button>
            <button 
              onClick={() => setActiveTab('Commodities')}
              className={`${activeTab === 'Commodities' ? 'bg-secondary-container text-on-secondary-container' : 'border border-outline bg-surface text-on-surface hover:bg-surface-container-low'} font-label-md text-label-md px-md py-xs rounded-full transition-colors`}
            >
              Commodities
            </button>
          </div>
        </div>

        {/* Major Indices Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-sm">
          {displayIndices.map((idx) => (
            <div key={idx.name} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-md flex flex-col justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant mb-sm">{idx.name}</span>
              <div className="flex items-end justify-between">
                <span className="font-headline-md text-headline-md font-bold text-on-surface">
                  {idx.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className={`font-label-sm text-label-sm flex flex-col items-end ${idx.up ? 'text-primary' : 'text-error'}`}>
                  <span>{idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)}</span>
                  <span>{idx.change_pct >= 0 ? '+' : ''}{idx.change_pct.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Sector Performance (Spans 8 cols) */}
          {/* NOTE: This section is static display content by design. No backend API counterpart exists. */}
          <div className="lg:col-span-8 bg-surface border border-outline-variant/30 rounded-xl p-lg flex flex-col">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-md">Sector Performance</h2>
            <div className="space-y-sm flex-1">
              {[
                { name: 'NIFTY IT', val: '+2.4%', color: 'bg-primary' },
                { name: 'NIFTY AUTO', val: '+1.8%', color: 'bg-primary/80' },
                { name: 'NIFTY METAL', val: '+0.9%', color: 'bg-primary/60' },
                { name: 'NIFTY PHARMA', val: '-0.4%', color: 'bg-error/60' },
                { name: 'NIFTY FMCG', val: '-1.2%', color: 'bg-error/80' },
              ].map((sector) => (
                <div key={sector.name} className="flex items-center gap-md">
                  <span className="w-32 font-label-sm text-label-sm text-on-surface">{sector.name}</span>
                  <div className="flex-1 bg-surface-container-highest rounded-full h-2 overflow-hidden flex items-center">
                    {sector.val.startsWith('+') ? (
                      <div className={`h-full ${sector.color}`} style={{ width: `${parseFloat(sector.val) * 10}%` }}></div>
                    ) : (
                      <div className="w-full flex justify-end h-full">
                         <div className={`h-full ${sector.color}`} style={{ width: `${Math.abs(parseFloat(sector.val)) * 10}%` }}></div>
                      </div>
                    )}
                  </div>
                  <span className={`w-12 text-right font-label-sm text-label-sm ${sector.val.startsWith('+') ? 'text-primary' : 'text-error'}`}>
                    {sector.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Movers (Spans 4 cols) */}
          {/* NOTE: This section is static display content by design. No backend API counterpart exists. */}
          <div className="lg:col-span-4 bg-surface border border-outline-variant/30 rounded-xl p-lg flex flex-col">
            <div className="flex justify-between items-center mb-md border-b border-outline-variant/20 pb-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Top Movers</h2>
              <div className="flex gap-xs">
                <button onClick={() => setMoverTab('Gainers')} className={`${moverTab === 'Gainers' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-primary'} font-label-sm text-label-sm transition-colors`}>Gainers</button>
                <span className="text-outline-variant">|</span>
                <button onClick={() => setMoverTab('Losers')} className={`${moverTab === 'Losers' ? 'text-error font-bold' : 'text-on-surface-variant hover:text-error'} font-label-sm text-label-sm transition-colors`}>Losers</button>
              </div>
            </div>
            <div className="space-y-md">
              {(moverTab === 'Gainers' ? [
                { sym: 'RELIANCE', ltp: '2,945.00', pct: '+3.4%' },
                { sym: 'TCS', ltp: '4,120.50', pct: '+2.8%' },
                { sym: 'HDFCBANK', ltp: '1,540.20', pct: '+2.1%' },
                { sym: 'INFY', ltp: '1,680.90', pct: '+1.9%' },
              ] : [
                { sym: 'HINDUNILVR', ltp: '2,345.00', pct: '-2.4%' },
                { sym: 'ITC', ltp: '412.50', pct: '-1.8%' },
                { sym: 'SBIN', ltp: '540.20', pct: '-1.1%' },
                { sym: 'LT', ltp: '3,680.90', pct: '-0.9%' },
              ]).map((stock) => (
                <div key={stock.sym} className="flex justify-between items-center hover:bg-surface-container-low p-xs -mx-xs rounded transition-colors cursor-pointer">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface font-bold">{stock.sym}</div>
                    <div className="font-body-sm text-[10px] text-on-surface-variant">Volume: 12.4M</div>
                  </div>
                  <div className="text-right">
                    <div className="font-body-md text-body-md tabular-nums text-on-surface">{stock.ltp}</div>
                    <div className={`font-label-sm text-label-sm ${stock.pct.startsWith('+') ? 'text-primary' : 'text-error'}`}>{stock.pct}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
