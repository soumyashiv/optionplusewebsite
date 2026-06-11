import type { AnalystData } from '../../../../hooks/useAnalyst';
import { computeMaxPain, fmtK, fmtCr } from '../../../../utils/analystAlgorithms';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface MaxPainTabProps {
  data: AnalystData | null;
}

export function MaxPainTab({ data }: MaxPainTabProps) {
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

  const { allStrikes, map, spot, atmSP, pcrOI } = data;

  // Use ATM ±5 for max pain (same logic as AnalysitScreen)
  const atmIdx = allStrikes.indexOf(atmSP);
  const mpLo = Math.max(0, atmIdx - 5);
  const mpHi = Math.min(allStrikes.length - 1, atmIdx + 5);
  const mpStrikes = allStrikes.slice(mpLo, mpHi + 1);

  // Compute max pain (mutates _pain field on each strike in map)
  const { mpStrike } = computeMaxPain(mpStrikes, map);

  const dist = spot - mpStrike;
  const distDisplay = (dist >= 0 ? '+' : '') + dist.toFixed(2);
  const pcrBias = pcrOI > 1.2 ? 'Bullish bias' : pcrOI < 0.8 ? 'Bearish bias' : 'Neutral';

  // Chart data
  const labels = mpStrikes.map(String);
  const ceOIArr = mpStrikes.map(s => map[s].ceOI);
  const peOIArr = mpStrikes.map(s => map[s].peOI);
  const painArr = mpStrikes.map(s => parseFloat(fmtCr(map[s]._pain ?? 0)));

  const ceColors = mpStrikes.map(s =>
    s === mpStrike || s === atmSP ? '#EAB308' : '#F87171'
  );
  const peColors = mpStrikes.map(s =>
    s === mpStrike || s === atmSP ? '#EAB308' : '#4ADE80'
  );
  const painColors = mpStrikes.map(s =>
    s === mpStrike ? '#EAB308' : '#93C5FD'
  );

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 10 }, autoSkip: false as const, maxRotation: 45 }, grid: { display: false } },
      y: { ticks: { font: { size: 10 }, callback: (v: string | number) => fmtK(Number(v)) }, grid: { color: 'rgba(0,0,0,0.04)' } },
    },
  };

  const painChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { font: { size: 10 }, autoSkip: false as const, maxRotation: 45 }, grid: { display: false } },
      y: { ticks: { font: { size: 10 }, callback: (v: string | number) => `${v}Cr` }, grid: { color: 'rgba(0,0,0,0.04)' } },
    },
  };

  return (
    <div className="space-y-lg">

      {/* ── Metric Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-sm text-center">
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-amber-800 mb-1">🎯 Max Pain</div>
          <div className="font-headline-sm font-bold text-amber-900 text-xl">{mpStrike}</div>
          <div className="font-label-sm text-xs text-amber-700">lowest total pain</div>
        </div>
        <div className="rounded-lg border border-outline-variant/30 bg-surface-container-low p-sm text-center">
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">NIFTY Spot</div>
          <div className="font-headline-sm font-bold text-on-surface text-xl">{spot.toLocaleString('en-IN')}</div>
          <div className="font-label-sm text-xs text-on-surface-variant">underlying value</div>
        </div>
        <div className={`rounded-lg border p-sm text-center ${dist >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`font-label-sm text-[10px] uppercase tracking-wider mb-1 ${dist >= 0 ? 'text-green-800' : 'text-red-800'}`}>
            Distance
          </div>
          <div className={`font-headline-sm font-bold text-xl ${dist >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {distDisplay}
          </div>
          <div className={`font-label-sm text-xs ${dist >= 0 ? 'text-green-700' : 'text-red-700'}`}>spot vs max pain</div>
        </div>
        <div className={`rounded-lg border p-sm text-center ${pcrOI > 1.2 ? 'bg-green-50 border-green-200' : pcrOI < 0.8 ? 'bg-red-50 border-red-200' : 'bg-surface-container-low border-outline-variant/30'}`}>
          <div className="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">PCR (OI)</div>
          <div className="font-headline-sm font-bold text-on-surface text-xl">{pcrOI}</div>
          <div className={`font-label-sm text-xs font-semibold ${pcrOI > 1.2 ? 'text-green-700' : pcrOI < 0.8 ? 'text-red-700' : 'text-on-surface-variant'}`}>
            {pcrBias}
          </div>
        </div>
      </div>

      {/* ── Charts ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* CE vs PE OI Chart */}
        <div>
          <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-sm">
            Call vs Put OI
            <span className="ml-2 font-normal normal-case text-[10px] text-amber-600">🟡 = Max Pain / ATM</span>
          </h4>
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-sm" style={{ height: 220 }}>
            <Bar
              data={{
                labels,
                datasets: [
                  { label: 'Call OI', data: ceOIArr, backgroundColor: ceColors, borderWidth: 0 },
                  { label: 'Put OI',  data: peOIArr, backgroundColor: peColors, borderWidth: 0 },
                ],
              }}
              options={chartOptions}
            />
          </div>
        </div>

        {/* Pain per Strike Chart */}
        <div>
          <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-sm">
            Total Pain per Strike (Cr)
            <span className="ml-2 font-normal normal-case text-[10px] text-amber-600">🟡 = Min pain = Max Pain</span>
          </h4>
          <div className="bg-surface rounded-lg border border-outline-variant/30 p-sm" style={{ height: 220 }}>
            <Bar
              data={{
                labels,
                datasets: [
                  { label: 'Pain (Cr)', data: painArr, backgroundColor: painColors, borderWidth: 0 },
                ],
              }}
              options={painChartOptions}
            />
          </div>
        </div>
      </div>

      {/* ── Strike-Level Detail Table ───────────────────────────────── */}
      <div>
        <h4 className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant mb-sm">
          Strike Detail Table
        </h4>
        <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30">
              <tr>
                <th className="p-sm font-bold">Strike</th>
                <th className="p-sm text-right text-red-700">CE OI</th>
                <th className="p-sm text-right text-green-700">PE OI</th>
                <th className="p-sm text-right">PCR</th>
                <th className="p-sm text-right text-blue-700">Pain (Cr)</th>
                <th className="p-sm min-w-[120px]">Pain Bar</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-outline-variant/20">
              {[...mpStrikes].reverse().map(sp => {
                const r = map[sp];
                const isMP = sp === mpStrike;
                const isATM = sp === atmSP;
                const pcr = r.ceOI ? +(r.peOI / r.ceOI).toFixed(2) : 0;
                const painCr = parseFloat(fmtCr(r._pain ?? 0));

                // Raw pain for percentage bar
                const rawPain = r._pain ?? 0;
                const rawMax = Math.max(...mpStrikes.map(s => map[s]._pain ?? 0));
                const rawPct = rawMax > 0 ? Math.round(rawPain / rawMax * 100) : 0;

                return (
                  <tr
                    key={sp}
                    className={`${isMP ? 'bg-amber-50' : isATM ? 'bg-amber-50/30' : 'hover:bg-surface-container-low'} transition-colors`}
                  >
                    <td className="p-sm font-bold font-mono">
                      {isMP && <span className="text-amber-600">🎯 </span>}
                      {isATM && !isMP && <span className="text-amber-500">★ </span>}
                      <span className={isMP ? 'text-amber-900' : isATM ? 'text-amber-700' : 'text-on-surface'}>
                        {sp}
                      </span>
                    </td>
                    <td className="p-sm text-right text-red-700 font-medium">{fmtK(r.ceOI)}</td>
                    <td className="p-sm text-right text-green-700 font-medium">{fmtK(r.peOI)}</td>
                    <td className={`p-sm text-right font-bold ${pcr > 1.5 ? 'text-green-700' : pcr > 0.8 ? 'text-on-surface' : 'text-red-700'}`}>
                      {pcr}
                    </td>
                    <td className={`p-sm text-right font-bold ${isMP ? 'text-amber-700' : 'text-blue-700'}`}>
                      {painCr}
                    </td>
                    <td className="p-sm">
                      <div className="flex items-center gap-sm">
                        <div className="flex-1 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isMP ? 'bg-amber-400' : 'bg-blue-300'}`}
                            style={{ width: `${rawPct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-on-surface-variant w-8 text-right">{rawPct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-on-surface-variant mt-xs px-1">
          Strike range: {mpStrikes[0]} — {mpStrikes[mpStrikes.length - 1]} (ATM±5)
        </p>
      </div>
    </div>
  );
}
