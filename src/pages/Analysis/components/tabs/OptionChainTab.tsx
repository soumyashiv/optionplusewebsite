
import type { AnalystData, Snapshot } from '../../../../hooks/useAnalyst';
import { fmtK } from '../../../../utils/analystAlgorithms';

interface OptionChainTabProps {
  data: AnalystData | null;
  history: Snapshot[];
}

export function OptionChainTab({ data }: OptionChainTabProps) {
  if (!data) return <div className="text-on-surface-variant">No data loaded.</div>;

  const { vis, map, atmSP, spot } = data;

  const getCOIColor = (coi: number) => {
    if (coi > 0) return 'text-green-600 bg-green-50 px-1 rounded font-bold';
    if (coi < 0) return 'text-red-600 bg-red-50 px-1 rounded font-bold';
    return 'text-on-surface-variant';
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
      <table className="w-full text-left border-collapse text-sm">
        <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant/30">
          <tr>
            <th colSpan={3} className="p-sm text-center border-r border-outline-variant/30 font-bold bg-green-50/50">CALLS</th>
            <th className="p-sm text-center border-r border-outline-variant/30 font-bold bg-surface-container-high w-24">STRIKE</th>
            <th colSpan={3} className="p-sm text-center font-bold bg-red-50/50">PUTS</th>
          </tr>
          <tr className="text-xs uppercase tracking-wider bg-surface-container-lowest">
            <th className="p-sm border-r border-outline-variant/30">OI (L)</th>
            <th className="p-sm border-r border-outline-variant/30">COI</th>
            <th className="p-sm border-r border-outline-variant/30">LTP</th>
            <th className="p-sm border-r border-outline-variant/30 text-center bg-surface-container-high">PRICE</th>
            <th className="p-sm border-r border-outline-variant/30">LTP</th>
            <th className="p-sm border-r border-outline-variant/30">COI</th>
            <th className="p-sm">OI (L)</th>
          </tr>
        </thead>
        <tbody className="bg-surface text-on-surface divide-y divide-outline-variant/20">
          {vis.map((sp: number) => {
            const row = map[sp];
            const isATM = sp === atmSP;
            const isITM_CE = sp < spot;
            const isITM_PE = sp > spot;

            return (
              <tr key={sp} className={`hover:bg-surface-variant/30 transition-colors ${isATM ? 'bg-amber-50/50' : ''}`}>
                <td className={`p-sm border-r border-outline-variant/30 text-right ${isITM_CE ? 'bg-yellow-50/30 font-medium' : ''}`}>
                  {fmtK(row.ceOI)}
                </td>
                <td className={`p-sm border-r border-outline-variant/30 text-right ${isITM_CE ? 'bg-yellow-50/30' : ''}`}>
                  <span className={getCOIColor(row.ceCOI)}>{fmtK(row.ceCOI)}</span>
                </td>
                <td className={`p-sm border-r border-outline-variant/30 text-right ${isITM_CE ? 'bg-yellow-50/30' : ''}`}>
                  {row.ceLTP.toFixed(1)}
                </td>
                
                <td className={`p-sm border-r border-outline-variant/30 text-center font-bold font-mono ${isATM ? 'bg-amber-200 text-amber-900' : 'bg-surface-container-high'}`}>
                  {sp}
                </td>
                
                <td className={`p-sm border-r border-outline-variant/30 text-right ${isITM_PE ? 'bg-yellow-50/30' : ''}`}>
                  {row.peLTP.toFixed(1)}
                </td>
                <td className={`p-sm border-r border-outline-variant/30 text-right ${isITM_PE ? 'bg-yellow-50/30' : ''}`}>
                  <span className={getCOIColor(row.peCOI)}>{fmtK(row.peCOI)}</span>
                </td>
                <td className={`p-sm text-right ${isITM_PE ? 'bg-yellow-50/30 font-medium' : ''}`}>
                  {fmtK(row.peOI)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
