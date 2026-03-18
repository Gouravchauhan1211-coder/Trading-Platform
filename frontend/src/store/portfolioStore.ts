import { create } from 'zustand';
import type { PortfolioHolding, PortfolioSummary } from '../types';

interface PortfolioState {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setHoldings: (holdings: PortfolioHolding[]) => void;
  setSummary: (summary: PortfolioSummary) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Sample data
const sampleHoldings: PortfolioHolding[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    quantity: 100,
    averagePrice: 2800.00,
    ltp: 2850.50,
    currentValue: 285050,
    pnl: 5050,
    pnlPercent: 1.80,
    allocation: 35.2,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    quantity: 50,
    averagePrice: 3850.00,
    ltp: 3850.75,
    currentValue: 192537.50,
    pnl: 37.50,
    pnlPercent: 0.02,
    allocation: 23.8,
  },
  {
    symbol: 'INFY',
    name: 'Infosys',
    quantity: 75,
    averagePrice: 1490.00,
    ltp: 1520.25,
    currentValue: 114018.75,
    pnl: 2268.75,
    pnlPercent: 2.03,
    allocation: 14.1,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    quantity: 80,
    averagePrice: 1675.00,
    ltp: 1680.50,
    currentValue: 134440,
    pnl: 440,
    pnlPercent: 0.33,
    allocation: 16.6,
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance',
    quantity: 20,
    averagePrice: 6700.00,
    ltp: 6850.25,
    currentValue: 137005,
    pnl: 3005,
    pnlPercent: 2.24,
    allocation: 10.3,
  },
];

const sampleSummary: PortfolioSummary = {
  totalValue: 863051.25,
  totalPnL: 10751.25,
  totalPnLPercent: 1.26,
  dayPnL: 3500.00,
  dayPnLPercent: 0.41,
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: sampleHoldings,
  summary: sampleSummary,
  isLoading: false,
  error: null,

  setHoldings: (holdings) => set({ holdings }),
  setSummary: (summary) => set({ summary }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));