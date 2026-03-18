import { create } from 'zustand';
import type { Strategy } from '../types';

interface StrategyState {
  strategies: Strategy[];
  isLoading: boolean;
  
  // Actions
  setStrategies: (strategies: Strategy[]) => void;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (id: string, strategyUpdate: Partial<Strategy>) => void;
  removeStrategy: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

// Sample strategies
const sampleStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Moving Average Crossover',
    status: 'ACTIVE',
    type: 'MOMENTUM',
    createdAt: '2024-01-01T00:00:00Z',
    lastRun: '2024-01-15T10:30:00Z',
    signals: 15,
  },
  {
    id: '2',
    name: 'RSI Reversal',
    status: 'ACTIVE',
    type: 'MEAN_REVERSION',
    createdAt: '2024-01-05T00:00:00Z',
    lastRun: '2024-01-15T09:15:00Z',
    signals: 8,
  },
  {
    id: '3',
    name: 'Bollinger Bands Breakout',
    status: 'PAUSED',
    type: 'BREAKOUT',
    createdAt: '2024-01-08T00:00:00Z',
    lastRun: '2024-01-12T14:00:00Z',
    signals: 5,
  },
  {
    id: '4',
    name: 'MACD Signal',
    status: 'ACTIVE',
    type: 'MOMENTUM',
    createdAt: '2024-01-10T00:00:00Z',
    lastRun: '2024-01-15T11:00:00Z',
    signals: 12,
  },
];

export const useStrategyStore = create<StrategyState>((set) => ({
  strategies: sampleStrategies,
  isLoading: false,

  setStrategies: (strategies) => set({ strategies }),
  
  addStrategy: (strategy) => set((state) => ({
    strategies: [...state.strategies, strategy],
  })),
  
  updateStrategy: (id, strategyUpdate) => set((state) => ({
    strategies: state.strategies.map((s) => 
      s.id === id ? { ...s, ...strategyUpdate } : s
    ),
  })),
  
  removeStrategy: (id) => set((state) => ({
    strategies: state.strategies.filter((s) => s.id !== id),
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));