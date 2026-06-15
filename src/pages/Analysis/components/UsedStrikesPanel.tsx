/**
 * UsedStrikesPanel.tsx
 *
 * Transparency panel that shows:
 *  - Selected Expiry
 *  - ATM Strike
 *  - All 11 strikes (ATM±5) used in analysis calculations
 *
 * This fulfils the requirement to display the exact dataset used for:
 *   PCR, OI Analysis, Change in OI, Call/Put Strength, Support & Resistance,
 *   Trend Analysis, Sentiment, Smart Money Flow, Strike Concentration.
 */
import { memo } from 'react';

interface UsedStrikesPanelProps {
  atmSP: number;
  usedStrikes: number[];
  expiry: string;
}

export const UsedStrikesPanel = memo(function UsedStrikesPanel({
  atmSP,
  usedStrikes,
  expiry,
}: UsedStrikesPanelProps) {
  if (!usedStrikes || usedStrikes.length === 0) return null;

  const sorted = [...usedStrikes].sort((a, b) => a - b);
  const atmIdx = sorted.indexOf(atmSP);

  return (
    <section className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-md py-sm bg-surface-container-low border-b border-outline-variant/20">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-base text-primary">analytics</span>
          <span className="font-label-md text-label-md font-semibold text-on-surface uppercase tracking-wider">
            Analysis Range
          </span>
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-mono">
            ATM ± 5 Strikes
          </span>
        </div>
        {expiry && (
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-xs text-on-surface-variant">calendar_today</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              Expiry:{' '}
              <strong className="text-on-surface font-semibold">{expiry}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Strike Grid */}
      <div className="p-md">
        <div className="flex items-center gap-xs mb-sm">
          <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider">
            ATM Strike:
          </span>
          <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-sm">
            {atmSP.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-sm">
          {sorted.map((strike, i) => {
            const isATM = strike === atmSP;
            const diff = i - atmIdx;
            const label = diff === 0 ? 'ATM' : diff > 0 ? `+${diff}` : `${diff}`;

            return (
              <div
                key={strike}
                className={`
                  flex flex-col items-center px-3 py-2 rounded-lg border transition-all
                  ${isATM
                    ? 'bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-200'
                    : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant/60'
                  }
                `}
              >
                <span className={`font-mono text-sm font-bold ${isATM ? 'text-amber-900' : 'text-on-surface'}`}>
                  {strike.toLocaleString('en-IN')}
                </span>
                <span className={`text-[10px] font-semibold mt-0.5 ${
                  isATM ? 'text-amber-700' : diff < 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isATM ? '★ ATM' : label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-on-surface-variant mt-sm leading-relaxed">
          All calculations — PCR, OI signals, Change in OI, Support/Resistance, Max Pain,
          Smart Money Flow, and Strike Concentration — use exclusively these{' '}
          <strong>{sorted.length} strikes</strong> for focused, high-accuracy analysis.
        </p>
      </div>
    </section>
  );
});
