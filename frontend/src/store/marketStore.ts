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
const sampleStocks: Record<string, Stock> = {
  'RELIANCE': {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    ltp: 2850.50,
    change: 45.25,
    changePercent: 1.61,
    volume: 5234000,
    high: 2875.00,
    low: 2810.00,
    open: 2820.00,
    previousClose: 2805.25,
  },
  'TCS': {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    ltp: 3850.75,
    change: -22.50,
    changePercent: -0.58,
    volume: 2345000,
    high: 3900.00,
    low: 3820.00,
    open: 3880.00,
    previousClose: 3873.25,
  },
  'INFY': {
    symbol: 'INFY',
    name: 'Infosys',
    ltp: 1520.25,
    change: 15.75,
    changePercent: 1.05,
    volume: 4521000,
    high: 1535.00,
    low: 1498.00,
    open: 1505.00,
    previousClose: 1504.50,
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    ltp: 1680.50,
    change: -8.25,
    changePercent: -0.49,
    volume: 6789000,
    high: 1695.00,
    low: 1670.00,
    open: 1690.00,
    previousClose: 1688.75,
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank',
    ltp: 950.25,
    change: 12.50,
    changePercent: 1.33,
    volume: 3456000,
    high: 960.00,
    low: 935.00,
    open: 940.00,
    previousClose: 937.75,
  },
  'SBIN': {
    symbol: 'SBIN',
    name: 'State Bank of India',
    ltp: 625.75,
    change: 8.25,
    changePercent: 1.34,
    volume: 7890000,
    high: 630.00,
    low: 615.00,
    open: 618.00,
    previousClose: 617.50,
  },
  'WIPRO': {
    symbol: 'WIPRO',
    name: 'Wipro',
    ltp: 420.50,
    change: -3.75,
    changePercent: -0.88,
    volume: 2345000,
    high: 425.00,
    low: 418.00,
    open: 424.00,
    previousClose: 424.25,
  },
  'BAJFINANCE': {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance',
    ltp: 6850.25,
    change: 125.50,
    changePercent: 1.87,
    volume: 1234000,
    high: 6900.00,
    low: 6700.00,
    open: 6750.00,
    previousClose: 6724.75,
  },
};

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
          stocks[symbol] = {
            symbol: symbol,
            name: symbol,
            ltp: parseFloat(item.lastPrice) || 0,
            change: 0,
            changePercent: 0,
            volume: parseInt(item.volume) || 0,
            high: parseFloat(item.highPrice) || 0,
            low: parseFloat(item.lowPrice) || 0,
            open: parseFloat(item.openPrice) || 0,
            previousClose: parseFloat(item.closePrice) || 0,
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