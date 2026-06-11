import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AnalysisTab = 'pcr' | 'maxpain' | 'algo';

interface AnalysisState {
  activeTab: AnalysisTab;
  setActiveTab: (tab: AnalysisTab) => void;
}

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      activeTab: 'pcr',
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    { name: 'analysis-store' }
  )
);
