
import type { AnalystData, Snapshot } from '../../../hooks/useAnalyst';
import { calcPF } from '../../../utils/analystAlgorithms';

interface MetricGridProps {
  data: AnalystData | null;
  latestSnapshot: Snapshot | null;
}

export function MetricGrid({ data, latestSnapshot }: MetricGridProps) {
  if (!data) return null;

  const { spot, atmSP, pcrOI, pcrCOI, vis } = data;
  const maxPain = latestSnapshot ? latestSnapshot.mpStrike : '—';

  // PCR Factor calculation
  const pf = calcPF(pcrOI, pcrCOI);
  let pfLabel = 'N/A';
  let pfBg = 'bg-surface-container-low border-outline-variant/30 text-on-surface';
  let pfText = 'text-on-surface';
  
  if (pf !== null) {
    if (pf > 1) {
      pfLabel = `${pf} (Bullish)`;
      pfBg = 'bg-green-50 border-green-200/50 text-green-900';
      pfText = 'text-green-800';
    } else if (pf < 1) {
      pfLabel = `${pf} (Bearish)`;
      pfBg = 'bg-red-50 border-red-200/50 text-red-900';
      pfText = 'text-red-800';
    } else {
      pfLabel = `${pf} (Neutral)`;
    }
  }

  const pcrOIBg = pcrOI > 1.2 ? 'bg-green-50 border-green-200/50 text-green-900' : pcrOI < 0.8 ? 'bg-red-50 border-red-200/50 text-red-900' : 'bg-surface-container-low border-outline-variant/30 text-on-surface';
  const pcrOILabel = pcrOI > 1.2 ? 'text-green-800' : pcrOI < 0.8 ? 'text-red-800' : 'text-on-surface-variant';
  
  const pcrCOIBg = pcrCOI > 1.2 ? 'bg-green-50 border-green-200/50 text-green-900' : pcrCOI < 0.8 ? 'bg-red-50 border-red-200/50 text-red-900' : 'bg-surface-container-low border-outline-variant/30 text-on-surface';
  const pcrCOILabel = pcrCOI > 1.2 ? 'text-green-800' : pcrCOI < 0.8 ? 'text-red-800' : 'text-on-surface-variant';

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-sm">
        <div className="bg-surface-container-low border border-outline-variant/30 rounded p-sm text-center">
          <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Spot</div>
          <div className="font-body-md font-bold text-on-surface">{spot.toLocaleString('en-IN')}</div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200/50 rounded p-sm text-center">
          <div className="font-label-sm text-label-sm text-amber-800 mb-1">ATM Strike</div>
          <div className="font-body-md font-bold text-amber-900">{atmSP}</div>
        </div>
        
        <div className="bg-surface-container-low border border-outline-variant/30 rounded p-sm text-center">
          <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Max Pain</div>
          <div className="font-body-md font-bold text-on-surface">{maxPain}</div>
        </div>
        
        <div className={`border rounded p-sm text-center ${pcrOIBg}`}>
          <div className={`font-label-sm text-label-sm mb-1 ${pcrOILabel}`}>PCR (OI)</div>
          <div className="font-body-md font-bold">{pcrOI}</div>
        </div>
        
        <div className={`border rounded p-sm text-center ${pcrCOIBg}`}>
          <div className={`font-label-sm text-label-sm mb-1 ${pcrCOILabel}`}>PCR (COI)</div>
          <div className="font-body-md font-bold">{pcrCOI}</div>
        </div>
        
        <div className={`border rounded p-sm text-center ${pfBg}`}>
          <div className={`font-label-sm text-label-sm mb-1 ${pfText}`}>PCR Factor</div>
          <div className="font-body-md font-bold">{pfLabel}</div>
        </div>
        
        <div className="bg-surface-container-low border border-outline-variant/30 rounded p-sm text-center">
          <div className="font-label-sm text-label-sm text-on-surface-variant mb-1">Total Strikes</div>
          <div className="font-body-md font-bold text-on-surface">{vis.length} Active</div>
        </div>
      </div>
    </section>
  );
}
