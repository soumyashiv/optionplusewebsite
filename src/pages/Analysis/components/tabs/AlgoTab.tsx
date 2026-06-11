

interface AlgoTabProps {
  glimpseData: any | null; // using any for now since the type is mixed
}

function FactorBar({ name, value, weight }: { name: string; value: number; weight: number }) {
  const barColor = value > 0 ? '#16A34A' : value < 0 ? '#DC2626' : '#EAB308';
  const displayVal = value > 0 ? 'Bullish' : value < 0 ? 'Bearish' : 'Neutral';
  
  return (
    <div className="flex items-center gap-sm group">
      <div className="w-36 shrink-0">
        <div className="text-xs text-on-surface-variant font-medium truncate">{name}</div>
        <div className="text-[10px] text-on-surface-variant/60">weight ×{weight}</div>
      </div>
      <div className="flex-1 h-4 bg-outline-variant/20 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ 
            width: value === 0 ? '50%' : `${50 + (value * 50)}%`, 
            background: value === 0 ? '#EAB308' : (value > 0 ? '#16A34A' : 'transparent'),
            marginLeft: value < 0 ? `${50 + (value * 50)}%` : '0',
            backgroundColor: barColor
          }}
        />
        {/* Neutral 50% line */}
        <div className="absolute top-0 bottom-0 w-px bg-on-surface-variant/30" style={{ left: '50%' }} />
      </div>
      <div
        className="w-16 text-right text-xs font-bold shrink-0"
        style={{ color: barColor }}
      >
        {displayVal}
      </div>
    </div>
  );
}

export function AlgoTab({ glimpseData }: AlgoTabProps) {
  if (!glimpseData) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
          <span>Waiting for market data…</span>
        </div>
      </div>
    );
  }

  const clex = glimpseData.backendAnalytics?.clex ?? glimpseData.clex?.conv ?? 0;
  const ca = glimpseData.backendAnalytics?.ca ?? glimpseData.ca?.conf ?? 0;
  const ua = glimpseData.backendAnalytics?.ua ?? glimpseData.ua?.conf ?? 0;
  const sf = glimpseData.backendAnalytics?.seven_factor || { score: 0, label: 'Neutral', factors: {} };
  const trendStrength = glimpseData.backendAnalytics?.trend_strength ?? 0;

  const isBull = sf.score > 20;
  const isBear = sf.score < -20;

  const verdictBg = isBull
    ? 'bg-gradient-to-br from-indigo-900 to-indigo-700 text-white'
    : isBear
    ? 'bg-gradient-to-br from-red-900 to-red-700 text-white'
    : 'bg-gradient-to-br from-slate-700 to-slate-600 text-white';

  const verdictIcon = isBull ? '📈' : isBear ? '📉' : '⚖️';
  const verdictTitle = isBull ? 'BULLISH MARKET' : isBear ? 'BEARISH MARKET' : 'SIDEWAYS';

  return (
    <div className="space-y-lg">

      {/* ── Main Verdict Card ──────────────────────────────────────── */}
      <div className={`rounded-xl p-lg shadow-md ${verdictBg}`}>
        <div className="flex items-start justify-between gap-md">
          <div>
            <div className="text-3xl mb-xs">{verdictIcon}</div>
            <div className="text-2xl font-bold tracking-tight">{verdictTitle}</div>
            <div className="text-sm opacity-80 mt-1">{sf.label} · 7-Factor Algorithm</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs opacity-60 mb-1">Composite Score</div>
            <div className="text-4xl font-black">{Math.round(sf.score)}</div>
            <div className="text-xs opacity-60">[-100 to +100]</div>
          </div>
        </div>
        {/* Trend Strength bar */}
        <div className="mt-md">
          <div className="flex justify-between text-xs mb-1 opacity-70">
            <span>Trend Strength</span>
            <span>{Math.round(trendStrength ?? 0)}%</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden relative">
            <div
              className="h-full rounded-full bg-white/90 transition-all duration-700"
              style={{ width: `${trendStrength ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── 7 Factors ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md">
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-md">
          7-Factor Score Breakdown
        </h4>
        <div className="space-y-sm">
          {sf.factors && Object.entries(sf.factors).map(([key, val]) => (
            <FactorBar
              key={key}
              name={key.replace(/_/g, ' ').toUpperCase()}
              value={Number(val)}
              weight={1}
            />
          ))}
        </div>
        <div className="mt-md pt-sm border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Weighted average of all factors</span>
          <span className="font-bold text-on-surface">Final Score: {Math.round(sf.score)}</span>
        </div>
      </div>

      {/* ── Legacy Algo Comparison ─────────────────────────────── */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-md">
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-md">
          Legacy AI Algorithms
        </h4>
        <div className="grid grid-cols-3 gap-sm">
          {/* CLEX */}
          <div className="rounded-lg p-sm text-center border border-outline-variant/30 bg-surface-container-low">
            <div className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">CLEX (0-100)</div>
            <div className="font-bold text-lg text-on-surface">
              {clex ?? '-'}
            </div>
          </div>
          {/* CA */}
          <div className="rounded-lg p-sm text-center border border-outline-variant/30 bg-surface-container-low">
            <div className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Contrarian Algo</div>
            <div className="font-bold text-lg text-on-surface">
              {ca ?? '-'}
            </div>
          </div>
          {/* UA */}
          <div className="rounded-lg p-sm text-center border border-outline-variant/30 bg-surface-container-low">
            <div className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">Unified Algo</div>
            <div className="font-bold text-lg text-on-surface">
              {ua ?? '-'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
