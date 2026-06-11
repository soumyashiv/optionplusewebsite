import { MarketWebSocket } from './websocket';
import type { WsMessage } from './websocket';
import { queryClient } from '../providers/QueryProvider';
import { queryKeys } from '../hooks/queries';
import { useMarketStore } from '../store/useMarketStore';

class WebSocketManager {
  private ws: MarketWebSocket | null = null;
  private currentSymbol: string | null = null;

  connect(symbol: string) {
    if (this.currentSymbol === symbol && this.ws) {
      return; // Already connected to this symbol
    }

    if (this.ws) {
      this.ws.disconnect();
    }

    this.currentSymbol = symbol;
    this.ws = new MarketWebSocket(
      symbol,
      this.handleMessage.bind(this),
      this.handleStateChange.bind(this)
    );
    this.ws.connect();
  }

  disconnect() {
    if (this.ws) {
      this.ws.disconnect();
      this.ws = null;
      this.currentSymbol = null;
    }
  }

  private handleMessage(msg: WsMessage) {
    if (!this.currentSymbol) return;

    // React Query Cache Injection based on msg.type / msg.data
    // Update market summary
    if (msg.type === 'snapshot' || msg.type === 'update') {
      if (msg.data) {
        queryClient.setQueryData(queryKeys.marketSummary(this.currentSymbol), msg.data);
        
        // Example for injecting into optionChain if included in payload
        // if (msg.data.option_chain) { ... }
      } else if (msg.type === 'update') {
        // If it's a generic update ping without data payload, invalidate to trigger refetch
        queryClient.invalidateQueries({ queryKey: queryKeys.marketSummary(this.currentSymbol) });
      }
    }
  }

  private handleStateChange(_state: 'connecting' | 'connected' | 'disconnected' | 'error') {
    // You could sync this state to a global store if the UI needs it
    // console.log(`WebSocket [${this.currentSymbol}] state: ${_state}`);
  }
}

export const wsManager = new WebSocketManager();

// Automatically connect/reconnect when the global market symbol changes
useMarketStore.subscribe((state, prevState) => {
  if (state.symbol !== prevState?.symbol) {
    wsManager.connect(state.symbol);
  }
});
