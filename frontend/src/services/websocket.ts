import { useMarketStore } from '../store';

const WS_URL = 'ws://localhost:8088/ws/market';
const RECONNECT_DELAY = 3000;

class MarketWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private isConnected = false;
  private messageHandlers: ((data: any) => void)[] = [];

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log('Connecting to WebSocket...');
    
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.scheduleReconnect();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private handleMessage(data: any) {
    const { updateStock } = useMarketStore.getState();
    
    if (data.symbol && data.price) {
      // Update stock in store
      const currentStock = useMarketStore.getState().stocks[data.symbol];
      const previousPrice = currentStock?.ltp || data.price;
      const change = data.price - previousPrice;
      const changePercent = (change / previousPrice) * 100;

      updateStock(data.symbol, {
        ltp: data.price,
        change: change,
        changePercent: changePercent,
        volume: data.volume,
        high: data.high,
        low: data.low,
        open: data.open,
        previousClose: data.close,
      });

      // Notify additional handlers
      this.messageHandlers.forEach(handler => handler(data));
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }
    
    console.log(`Reconnecting in ${RECONNECT_DELAY}ms...`);
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_DELAY);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  subscribe(handler: (data: any) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
export const marketWebSocket = new MarketWebSocket();

// Alias for backward compatibility
export const wsService = marketWebSocket;

// React hook for using WebSocket
export function useMarketWebSocket() {
  return marketWebSocket;
}
