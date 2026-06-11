import { useState } from 'react';
import type { AnalystData, Snapshot, PcrHistoryPoint } from '../../../hooks/useAnalyst';
import type { GlimpseData } from '../../../utils/analystAlgorithms';
import { OptionChainTab } from './tabs/OptionChainTab';
import { PCRChartTab } from './tabs/PCRChartTab';
import { PCRSignalsTab } from './tabs/PCRSignalsTab';
import { MaxPainTab } from './tabs/MaxPainTab';
import { AlgoTab } from './tabs/AlgoTab';

interface AnalystTabsProps {
  data: AnalystData | null;
  history: Snapshot[];
  pcrHistory: PcrHistoryPoint[];
  pcrHistoryLoading: boolean;
  glimpseData: GlimpseData | null;
}

const TABS = [
  'Option Chain',
  'PCR & Signals',
  'PCR Chart',
  'Max Pain',
  '7 Factor Algo'
];

export function AnalystTabs({ 
  data, 
  history,
  pcrHistory,
  pcrHistoryLoading,
  glimpseData,
}: AnalystTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-[600px]">
      
      {/* Tab Navigation */}
      <div className="bg-surface-container-low px-sm pt-sm flex overflow-x-auto border-b border-outline-variant/30 no-scrollbar">
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`px-lg py-sm font-label-sm tracking-wider uppercase transition-colors whitespace-nowrap border-b-2 ${
              activeTab === idx 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 rounded-t-lg'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 p-md lg:p-lg overflow-y-auto">
        {activeTab === 0 && <OptionChainTab data={data} history={history} />}
        {activeTab === 1 && <PCRSignalsTab data={data} />}
        {activeTab === 2 && <PCRChartTab pcrHistory={pcrHistory} pcrHistoryLoading={pcrHistoryLoading} history={history} />}
        {activeTab === 3 && <MaxPainTab data={data} />}
        {activeTab === 4 && <AlgoTab glimpseData={glimpseData} />}
      </div>
    </section>
  );
}
