import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MarketState {
  symbol: string;
  timeframe: '1D' | '1W' | '1M';
  setSymbol: (symbol: string) => void;
  setTimeframe: (timeframe: '1D' | '1W' | '1M') => void;
}

export const useMarketStore = create<MarketState>()(
  persist(
    (set) => ({
      symbol: 'NIFTY',
      timeframe: '1D',
      setSymbol: (symbol) => set({ symbol: symbol || 'NIFTY' }),
      setTimeframe: (timeframe) => set({ timeframe }),
    }),
    { 
      name: 'market-store',
      onRehydrateStorage: () => (state) => {
        if (state && !state.symbol) {
          state.symbol = 'NIFTY';
        }
      }
    }
  )
);
