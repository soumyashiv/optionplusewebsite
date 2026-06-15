import { memo } from 'react';
import type { GlimpseData } from '../../../utils/analystAlgorithms';

interface AlgorithmGlimpseProps {
  glimpseData: GlimpseData | null;
}

export const AlgorithmGlimpse = memo(function AlgorithmGlimpse({ glimpseData }: AlgorithmGlimpseProps) {
  if (!glimpseData) {
    return (
      <section>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Algorithm Glimpse</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md text-on-surface-variant">
          <p>Please load data to view analysis.</p>
        </div>
      </section>
    );
  }

  const { clex, ca, ua, final, backendAnalytics } = glimpseData;
  const sf = backendAnalytics?.seven_factor;
  const isSfBull = sf ? sf.score > 0 : clex.isBull;
  const sfLabel = sf ? sf.label : (clex.isBull ? 'Super Bullish' : 'Bearish');
  const sfScore = sf ? Math.round(Math.abs(sf.score)) : clex.conv;

  return (
    <section>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md">Algorithm Glimpse</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
        
        {/* Card 1: 7 Factor Algo */}
        <div className={`border rounded-xl p-md flex flex-col justify-between h-32 relative overflow-hidden ${isSfBull ? 'bg-[#f0ebfc] border-[#d6cbf5]' : 'bg-red-50 border-red-200'}`}>
          <div className="absolute top-0 right-0 p-sm opacity-20">
            <span className="material-symbols-outlined text-4xl" style={{ color: isSfBull ? '#534AB7' : '#991B1B' }}>auto_awesome</span>
          </div>
          <span className={`font-label-sm text-label-sm uppercase tracking-wider z-10 ${isSfBull ? 'text-[#534AB7]' : 'text-red-800'}`}>7 Factor Algo</span>
          <div className="z-10 mt-auto">
            <div className={`font-headline-sm text-headline-sm font-bold ${isSfBull ? 'text-[#3a337e]' : 'text-red-900'}`}>{sfLabel}</div>
            <div className={`font-label-sm flex items-center gap-xs ${isSfBull ? 'text-[#534AB7]/80' : 'text-red-800/80'}`}>
              <span className="material-symbols-outlined text-xs">{isSfBull ? 'trending_up' : 'trending_down'}</span>
              Score: {sfScore}
            </div>
          </div>
        </div>

        {/* Card 2: Weighted Score */}
        <div className={`border rounded-xl p-md flex flex-col justify-between h-32 ${ca.isBull ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' : 'bg-gradient-to-br from-orange-50 to-red-100 border-red-200'}`}>
          <span className={`font-label-sm text-label-sm uppercase tracking-wider ${ca.isBull ? 'text-emerald-800' : 'text-red-800'}`}>Weighted Score</span>
          <div className="mt-auto">
            <div className={`font-headline-sm text-headline-sm font-bold ${ca.isBull ? 'text-emerald-700' : 'text-red-700'}`}>{ca.isBull ? 'Strong Buy' : 'Strong Sell'}</div>
            <div className={`font-label-sm ${ca.isBull ? 'text-emerald-600/80' : 'text-red-600/80'}`}>Score: {Math.round((ca.conf / 100) * 10 * 10) / 10}/10</div>
          </div>
        </div>

        {/* Card 3: PCR+OI Wall */}
        <div className={`border rounded-xl p-md flex flex-col justify-between h-32 ${ua.isBull ? 'bg-blue-50 border-blue-100' : 'bg-rose-50 border-rose-200'}`}>
          <span className={`font-label-sm text-label-sm uppercase tracking-wider ${ua.isBull ? 'text-blue-800' : 'text-rose-800'}`}>PCR+OI Wall</span>
          <div className="mt-auto">
            <div className={`font-headline-sm text-headline-sm font-bold ${ua.isBull ? 'text-blue-900' : 'text-rose-900'}`}>{ua.isBull ? `Res at ${ua.entry}` : `Sup at ${ua.entry}`}</div>
            <div className={`font-label-sm flex items-center gap-xs ${ua.isBull ? 'text-blue-700/80' : 'text-rose-700/80'}`}>
              <span className="material-symbols-outlined text-xs">{ua.isBull ? 'trending_up' : 'trending_down'}</span>
              Strong {ua.isBull ? 'Put' : 'Call'} Writing
            </div>
          </div>
        </div>

        {/* Card 4: Final Verdict */}
        <div className={`border rounded-xl p-md flex flex-col justify-between h-32 shadow-sm ${final.isBull ? 'bg-primary border-primary-container text-on-primary' : 'bg-red-700 border-red-800 text-white'}`}>
          <div className="flex justify-between items-start">
            <span className="font-label-sm text-label-sm text-inverse-primary uppercase tracking-wider">Final Verdict</span>
            <span className="material-symbols-outlined text-secondary-fixed">check_circle</span>
          </div>
          <div className="mt-auto flex justify-between items-end">
            <div className="font-headline-sm text-headline-sm font-bold text-secondary-fixed tracking-tight">{final.isBull ? 'BULLISH' : 'BEARISH'}</div>
            <div className="text-right">
              <div className="font-label-sm text-[10px] text-inverse-primary">
                ENTRY: ~{clex?.entry && clex.entry !== 0 ? clex.entry : (backendAnalytics?.max_pain ?? '—')}
              </div>
              <div className="font-label-sm text-[10px] text-inverse-primary">
                SL: {clex?.sl && clex.sl !== 0 ? clex.sl : (backendAnalytics?.max_pain ?? '—')}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
