import { create } from 'zustand';
import type { Stock, MarketData, Watchlist, ChartData } from '../types';
import { marketApi } from '../services/api';

interface MarketState {
  stocks: Record<string, Stock>;
  watchlists: Watchlist[];
  selectedSymbol: string | null;
  chartData: ChartData[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStocks: () => Promise<void>;
  setStocks: (stocks: Record<string, Stock>) => void;
  updateStock: (symbol: string, data: Partial<Stock>) => void;
  setWatchlists: (watchlists: Watchlist[]) => void;
  addWatchlist: (watchlist: Watchlist) => void;
  removeWatchlist: (id: string) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  setChartData: (data: ChartData[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Sample data for demonstration
const sampleStocks: Record<string, Stock> = {};

const defaultWatchlists: Watchlist[] = [
  {
    id: '1',
    name: 'Nifty 50',
    symbols: ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK', 'SBIN'],
  },
  {
    id: '2',
    name: 'IT Stocks',
    symbols: ['TCS', 'INFY', 'WIPRO'],
  },
  {
    id: '3',
    name: 'Finance',
    symbols: ['HDFCBANK', 'ICICIBANK', 'BAJFINANCE'],
  },
];

export const useMarketStore = create<MarketState>((set) => ({
  stocks: sampleStocks,
  watchlists: defaultWatchlists,
  selectedSymbol: 'RELIANCE',
  chartData: [],
  isLoading: false,
  error: null,

  setStocks: (stocks) => set({ stocks }),
  
  updateStock: (symbol, data) => set((state) => {
    const existingStock = state.stocks[symbol];
    const dataAny = data as any;
    if (!existingStock) {
      // Create new stock entry
      const newStock: Stock = {
        symbol,
        name: symbol,
        ltp: data.ltp || 0,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0,
        high: data.high || data.ltp || 0,
        low: data.low || data.ltp || 0,
        open: data.open || data.ltp || 0,
        previousClose: data.previousClose || dataAny.close || data.ltp || 0,
      };
      return {
        stocks: {
          ...state.stocks,
          [symbol]: newStock,
        },
      };
    }
    return {
      stocks: {
        ...state.stocks,
        [symbol]: { 
          ...existingStock, 
          ...data,
          high: data.high ?? existingStock.high,
          low: data.low ?? existingStock.low,
          open: data.open ?? existingStock.open,
          previousClose: data.previousClose ?? existingStock.previousClose,
        },
      },
    };
  }),
  
  setWatchlists: (watchlists) => set({ watchlists }),
  
  addWatchlist: (watchlist) => set((state) => ({
    watchlists: [...state.watchlists, watchlist],
  })),
  
  removeWatchlist: (id) => set((state) => ({
    watchlists: state.watchlists.filter((w) => w.id !== id),
  })),
  
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  
  setChartData: (data) => set({ chartData: data }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),

  fetchStocks: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await marketApi.getMarketData();
      // Transform backend data to frontend format
      const stocks: Record<string, Stock> = {};
      
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const symbol = item.symbol;
          const lastPrice = parseFloat(item.lastPrice) || 0;
          const closePrice = parseFloat(item.closePrice) || 0;
          const change = lastPrice - closePrice;
          const changePercent = closePrice !== 0 ? (change / closePrice) * 100 : 0;
          
          stocks[symbol] = {
            symbol: symbol,
            name: symbol,
            ltp: lastPrice,
            change: change,
            changePercent: changePercent,
            volume: parseInt(item.volume) || 0,
            high: parseFloat(item.highPrice) || 0,
            low: parseFloat(item.lowPrice) || 0,
            open: parseFloat(item.openPrice) || 0,
            previousClose: closePrice,
          };
        });
      }
      
      set({ stocks, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch stocks:', error);
      set({ error: 'Failed to fetch stocks', isLoading: false });
    }
  },
}));