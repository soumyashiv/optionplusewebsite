/**
 * websocket.ts — WebSocket client with auto-reconnect for real-time market data.
 *
 * Connects to /ws/market/{symbol} on the backend.
 * Auth: passes token as ?token= query parameter.
 * Features:
 *   - Exponential backoff reconnection
 *   - Heartbeat (ping/pong) handling
 *   - Event-based message dispatch
 *   - Connection state management
 */
import { supabase } from '../auth/supabaseClient';
import { env } from '../config/env';

export type WsMessageType = 'snapshot' | 'update' | 'error' | 'ping';

export interface WsMessage {
  type: WsMessageType;
  symbol?: string;
  data?: unknown;
  direction?: string;
  ts?: string;
  message?: string;
}

type MessageHandler = (msg: WsMessage) => void;
type StateHandler = (state: 'connecting' | 'connected' | 'disconnected' | 'error') => void;

export class MarketWebSocket {
  private ws: WebSocket | null = null;
  private symbol: string;
  private reconnectAttempt = 0;
  private maxReconnectAttempt = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private onMessage: MessageHandler;
  private onStateChange: StateHandler;
  private intentionallyClosed = false;

  constructor(symbol: string, onMessage: MessageHandler, onStateChange: StateHandler) {
    this.symbol = symbol.toUpperCase();
    this.onMessage = onMessage;
    this.onStateChange = onStateChange;
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.intentionallyClosed = false;
    this.onStateChange('connecting');

    // Get auth token
    let token = env.APP_API_KEY || '';
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      token = session.access_token;
    }

    const url = `${env.WS_BASE_URL}/ws/market/${this.symbol}?token=${encodeURIComponent(token)}`;

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.reconnectAttempt = 0;
        this.onStateChange('connected');
        this.startPing();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as WsMessage;
          if (msg.type === 'ping') {
            // Server keepalive — no action needed
            return;
          }
          this.onMessage(msg);
        } catch {
          // Non-JSON message (pong text)
          if (event.data === 'pong') return;
        }
      };

      this.ws.onclose = (event) => {
        this.stopPing();
        this.onStateChange('disconnected');

        if (!this.intentionallyClosed && event.code !== 4001 && event.code !== 4002) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = () => {
        this.onStateChange('error');
      };

    } catch {
      this.onStateChange('error');
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.intentionallyClosed = true;
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.onStateChange('disconnected');
  }

  private startPing() {
    this.stopPing();
    // Send ping every 25s to keep connection alive
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 25_000);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempt >= this.maxReconnectAttempt) {
      this.onStateChange('error');
      return;
    }

    // Exponential backoff: 1s, 2s, 4s, 8s, ... max 30s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempt), 30_000);
    const jitter = Math.random() * 1000;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempt++;
      this.connect();
    }, delay + jitter);
  }
}
