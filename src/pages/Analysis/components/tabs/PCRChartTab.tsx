import type { Snapshot, PcrHistoryPoint } from '../../../../hooks/useAnalyst';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PCRChartTabProps {
  /** Backend PCR history from /api/v1/pcr-history (primary source) */
  pcrHistory: PcrHistoryPoint[];
  /** Whether backend PCR history is still loading */
  pcrHistoryLoading: boolean;
  /** Local snapshot history (fallback) */
  history: Snapshot[];
}

export function PCRChartTab({ pcrHistory, pcrHistoryLoading, history }: PCRChartTabProps) {
  // Use backend PCR history if available, otherwise fall back to local snapshots
  const useBackend = pcrHistory.length > 0;

  if (pcrHistoryLoading && pcrHistory.length === 0 && history.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-on-surface-variant">
        <div className="flex flex-col items-center gap-sm">
          <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
          <span>Loading PCR history...</span>
        </div>
      </div>
    );
  }

  if (!useBackend && history.length === 0) {
    return <div className="text-on-surface-variant">No historical data. Please wait for data to accumulate.</div>;
  }

  let labels: string[];
  let pcrOIData: number[];
  let pcrCOIData: number[] | null = null;

  if (useBackend) {
    // Backend PCR history — already in chronological order (oldest first)
    labels = pcrHistory.map(p => {
      const timePart = p.ts.split(' ')[1] || p.ts.split('T')[1]?.slice(0, 8) || p.ts;
      return timePart;
    });
    pcrOIData = pcrHistory.map(p => p.pcr);
  } else {
    // Fallback: local snapshot history (newest first → reverse for chart)
    const reversedHistory = [...history].reverse();
    labels = reversedHistory.map(s => s.ts.split(' ')[1] || s.ts);
    pcrOIData = reversedHistory.map(s => s.pcrOI);
    pcrCOIData = reversedHistory.map(s => s.pcrCOI);
  }

  const datasets = [
    {
      label: 'PCR (OI)',
      data: pcrOIData,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.08)',
      tension: 0.3,
      pointRadius: pcrOIData.length > 50 ? 0 : 2,
      borderWidth: 2,
      fill: true,
    },
  ];

  // Add COI dataset only when using local fallback (backend doesn't have COI history)
  if (pcrCOIData) {
    datasets.push({
      label: 'PCR (COI)',
      data: pcrCOIData,
      borderColor: '#eab308',
      backgroundColor: 'rgba(234, 179, 8, 0.08)',
      tension: 0.3,
      pointRadius: pcrCOIData.length > 50 ? 0 : 2,
      borderWidth: 2,
      fill: true,
    });
  }

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 12,
          maxRotation: 0,
          font: { size: 10 },
        },
        grid: {
          display: false,
        },
      },
      y: {
        min: 0,
        max: 2.5,
        ticks: {
          stepSize: 0.5,
        },
      },
    },
  };

  return (
    <div className="bg-surface p-md rounded-lg border border-outline-variant/30 h-96 relative">
      {useBackend && (
        <div className="absolute top-2 right-3 flex items-center gap-1 text-[10px] text-on-surface-variant/60">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Backend · {pcrHistory.length} pts
        </div>
      )}
      <Line data={chartData} options={options} />
    </div>
  );
}
