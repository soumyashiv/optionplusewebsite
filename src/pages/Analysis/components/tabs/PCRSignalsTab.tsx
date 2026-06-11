import type { AnalystData } from '../../../../hooks/useAnalyst';
import { classify, fmtK, rSig } from '../../../../utils/analystAlgorithms';

interface PCRSignalsTabProps {
  data: AnalystData | null;
}

function SignalBadge({ label, cls }: { label: string; cls: string }) {
  const colorMap: Record<string, string> = {
    'b-sbull': 'bg-indigo-900 text-white',
    'b-sbear': 'bg-amber-900 text-white',
    'b-buy':   'bg-green-700 text-white',
    'b-sell':  'bg-red-700 text-white',
    'b-bull':  'bg-green-100 text-green-900 border border-green-300',
    'b-bear':  'bg-red-100 text-red-900 border border-red-300',
    'b-neu':   'bg-surface-variant text-on-surface-variant',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${colorMap[cls] ?? 'bg-surface-variant text-on-surface-variant'}`}>
      {label}
    </span>
  );
}

function RatioPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${color}`}>
      <span className="opacity-60">{label}</span>
      <span>{value}</span>
    </span>
  );
}

export function PCRSignalsTab({ data }: PCRSignalsTabProps) {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
          <span>Waiting for market data…</span>
        </div>
      </div>
    );
  }

  const { vis, map, atmSP, pcrOI, pcrCOI, tCeOI, tPeOI, tCeCOI, tPeCOI } = data;

  // Max CE and PE OI (for OI wall detection)
  let maxCeOI = 0, maxCeOISP = 0, maxPeOI = 0, maxPeOISP = 0;
  vis.forEach(sp => {
    if (map[sp].ceOI > maxCeOI) { maxCeOI = map[sp].ceOI; maxCeOISP = sp; }
    if (map[sp].peOI > maxPeOI) { maxPeOI = map[sp].peOI; maxPeOISP = sp; }
  });

  // Max OI across all strikes for bar width normalisation
  const mOIb = Math.max(...vis.map(sp => Math.max(map[sp].ceOI, map[sp].peOI)));

  const pcrOIBias = pcrOI > 1.2 ? 'Bullish' : pcrOI < 0.8 ? 'Bearish' : 'Neutral';
  const pcrCOIBias = pcrCOI > 1.2 ? 'Bullish' : pcrCOI < 0.8 ? 'Bearish' : 'Neutral';
  const biasColor = (b: string) =>
    b === 'Bullish' ? 'text-green-700' : b === 'Bearish' ? 'text-red-700' : 'text-on-surface-variant';

  const comboCeOI = tCeOI + tCeCOI;
  const comboPeOI = tPeOI + tPeCOI;
  const comboRatio = comboCeOI ? +(comboPeOI / comboCeOI).toFixed(2) : 0;

  return (
    <div className="space-y-lg">

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        {/* PCR OI */}
        <div className={`rounded-lg border p-sm text-center ${pcrOI > 1.2 ? 'bg-green-50 border-green-200' : pcrOI < 0.8 ? 'bg-red-50 border-red-200' : 'bg-surface-container-low border-outline-variant/30'}`}>
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">PCR (OI)</div>
          <div className="font-headline-sm font-bold text-on-surface text-lg">{pcrOI}</div>
          <div className={`font-label-sm text-xs font-semibold ${biasColor(pcrOIBias)}`}>{pcrOIBias}</div>
        </div>
        {/* PCR COI */}
        <div className={`rounded-lg border p-sm text-center ${pcrCOI > 1.2 ? 'bg-green-50 border-green-200' : pcrCOI < 0.8 ? 'bg-red-50 border-red-200' : 'bg-surface-container-low border-outline-variant/30'}`}>
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">PCR (COI)</div>
          <div className="font-headline-sm font-bold text-on-surface text-lg">{pcrCOI}</div>
          <div className={`font-label-sm text-xs font-semibold ${biasColor(pcrCOIBias)}`}>{pcrCOIBias}</div>
        </div>
        {/* Max CE Wall */}
        <div className="rounded-lg border bg-red-50 border-red-200 p-sm text-center">
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-red-800 mb-1">CE Wall (Resistance)</div>
          <div className="font-headline-sm font-bold text-red-900 text-lg">{maxCeOISP}</div>
          <div className="font-label-sm text-xs text-red-700">{fmtK(maxCeOI)} OI</div>
        </div>
        {/* Max PE Wall */}
        <div className="rounded-lg border bg-green-50 border-green-200 p-sm text-center">
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-green-800 mb-1">PE Wall (Support)</div>
          <div className="font-headline-sm font-bold text-green-900 text-lg">{maxPeOISP}</div>
          <div className="font-label-sm text-xs text-green-700">{fmtK(maxPeOI)} OI</div>
        </div>
      </div>

      {/* ── OI Totals Bar ──────────────────────────────────────────── */}
      <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-sm">
        <div className="flex justify-between text-xs text-on-surface-variant mb-2 px-1">
          <span className="font-semibold text-red-700">Total CE OI: {fmtK(tCeOI)}</span>
          <span className="font-semibold text-on-surface-variant">
            Combo Ratio: <span className={comboRatio > 1.2 ? 'text-green-700' : comboRatio < 0.8 ? 'text-red-700' : 'text-on-surface'}>{comboRatio}</span>
            <span className="ml-1 text-[10px] opacity-60">({rSig(comboRatio)})</span>
          </span>
          <span className="font-semibold text-green-700">Total PE OI: {fmtK(tPeOI)}</span>
        </div>
        <div className="flex gap-0.5 h-3 rounded overflow-hidden">
          <div
            className="bg-red-400 transition-all duration-500"
            style={{ width: `${tCeOI + tPeOI > 0 ? (tCeOI / (tCeOI + tPeOI)) * 100 : 50}%` }}
          />
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${tCeOI + tPeOI > 0 ? (tPeOI / (tCeOI + tPeOI)) * 100 : 50}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 px-1">
          <span>Call OI dominance</span>
          <span>Put OI dominance</span>
        </div>
      </div>

      {/* ── Per-Strike Signal Table ─────────────────────────────────── */}
      <div>
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-sm">
          Strike Signals — ATM±5 Window
        </h4>
        <div className="space-y-2">
          {[...vis].reverse().map(sp => {
            const r = map[sp];
            const c = classify(r.ceOI, r.ceCOI, r.peOI, r.peCOI);
            const isATM = sp === atmSP;
            const barW = mOIb > 0 ? Math.round(Math.max(r.ceOI, r.peOI) / mOIb * 100) : 0;

            return (
              <div
                key={sp}
                className={`rounded-lg border p-sm transition-colors ${isATM ? 'border-amber-300 bg-amber-50/60' : 'border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low'}`}
              >
                <div className="flex items-start justify-between gap-sm">
                  {/* Strike + OI bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-xs mb-1">
                      <span className={`font-mono font-bold text-sm ${isATM ? 'text-amber-900' : 'text-on-surface'}`}>
                        {sp}
                      </span>
                      {isATM && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1 rounded">ATM ★</span>
                      )}
                    </div>
                    {/* OI bar */}
                    <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barW}%`, background: c.bc }}
                      />
                    </div>
                  </div>

                  {/* Signal badge + ratios */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <SignalBadge label={c.label} cls={c.cls} />
                    <div className="flex gap-1 flex-wrap justify-end">
                      <RatioPill
                        label="OIR"
                        value={c.oir}
                        color={c.oir > 1 ? 'border-green-300 text-green-800 bg-green-50' : 'border-red-300 text-red-800 bg-red-50'}
                      />
                      <RatioPill
                        label="COIR"
                        value={c.coir}
                        color={c.coir > 1 ? 'border-green-300 text-green-800 bg-green-50' : 'border-red-300 text-red-800 bg-red-50'}
                      />
                      <RatioPill
                        label="X"
                        value={c.xv}
                        color={c.xv > 1 ? 'border-green-300 text-green-800 bg-green-50' : c.xv < 1 && c.xv !== 0 ? 'border-red-300 text-red-800 bg-red-50' : 'border-outline-variant/50 text-on-surface-variant bg-surface-variant'}
                      />
                    </div>
                  </div>
                </div>

                {/* CE / PE OI detail row */}
                <div className="flex gap-md mt-1.5 text-[11px] text-on-surface-variant">
                  <span className="text-red-700">CE OI: <strong>{fmtK(r.ceOI)}</strong></span>
                  <span className="text-red-600">CE COI: <strong className={r.ceCOI >= 0 ? 'text-green-600' : 'text-red-600'}>{fmtK(r.ceCOI)}</strong></span>
                  <span className="text-green-700">PE OI: <strong>{fmtK(r.peOI)}</strong></span>
                  <span className="text-green-600">PE COI: <strong className={r.peCOI >= 0 ? 'text-green-600' : 'text-red-600'}>{fmtK(r.peCOI)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
