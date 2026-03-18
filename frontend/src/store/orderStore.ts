import { create } from 'zustand';
import type { Order, Position, Trade, Signal } from '../types';

interface OrderState {
  orders: Order[];
  positions: Position[];
  trades: Trade[];
  signals: Signal[];
  selectedOrderTab: 'positions' | 'orders' | 'trades' | 'signals';
  
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  removeOrder: (id: string) => void;
  setPositions: (positions: Position[]) => void;
  updatePosition: (id: string, position: Partial<Position>) => void;
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  setSignals: (signals: Signal[]) => void;
  addSignal: (signal: Signal) => void;
  setSelectedOrderTab: (tab: 'positions' | 'orders' | 'trades' | 'signals') => void;
}

// Sample data
const samplePositions: Position[] = [
  {
    id: '1',
    symbol: 'RELIANCE',
    quantity: 100,
    averagePrice: 2800.00,
    currentPrice: 2850.50,
    pnl: 5050,
    pnlPercent: 1.80,
    side: 'LONG',
  },
  {
    id: '2',
    symbol: 'INFY',
    quantity: 50,
    averagePrice: 1500.00,
    currentPrice: 1520.25,
    pnl: 1012.50,
    pnlPercent: 1.35,
    side: 'LONG',
  },
  {
    id: '3',
    symbol: 'SBIN',
    quantity: 200,
    averagePrice: 615.00,
    currentPrice: 625.75,
    pnl: 2150,
    pnlPercent: 1.75,
    side: 'LONG',
  },
];

const sampleOrders: Order[] = [
  {
    id: '1',
    symbol: 'HDFCBANK',
    side: 'BUY',
    type: 'LIMIT',
    quantity: 100,
    price: 1685.00,
    status: 'PENDING',
    createdAt: '2024-01-15T10:30:00Z',
    productType: 'CNC',
  },
  {
    id: '2',
    symbol: 'BAJFINANCE',
    side: 'BUY',
    type: 'MARKET',
    quantity: 25,
    status: 'EXECUTED',
    createdAt: '2024-01-15T09:45:00Z',
    executedAt: '2024-01-15T09:45:15Z',
    productType: 'MIS',
  },
];

const sampleTrades: Trade[] = [
  {
    id: '1',
    orderId: '2',
    symbol: 'BAJFINANCE',
    side: 'BUY',
    quantity: 25,
    price: 6850.00,
    timestamp: '2024-01-15T09:45:15Z',
  },
  {
    id: '2',
    orderId: '3',
    symbol: 'RELIANCE',
    side: 'BUY',
    quantity: 50,
    price: 2800.00,
    timestamp: '2024-01-14T14:30:00Z',
  },
];

const sampleSignals: Signal[] = [
  {
    id: '1',
    symbol: 'INFY',
    type: 'ENTRY',
    direction: 'LONG',
    price: 1520.00,
    timestamp: '2024-01-15T10:30:00Z',
    strategy: 'Moving Average Crossover',
  },
  {
    id: '2',
    symbol: 'TCS',
    type: 'EXIT',
    direction: 'LONG',
    price: 3850.00,
    timestamp: '2024-01-15T09:15:00Z',
    strategy: 'RSI Reversal',
  },
];

export const useOrderStore = create<OrderState>((set) => ({
  orders: sampleOrders,
  positions: samplePositions,
  trades: sampleTrades,
  signals: sampleSignals,
  selectedOrderTab: 'positions',

  setOrders: (orders) => set({ orders }),
  
  addOrder: (order) => set((state) => ({
    orders: [order, ...state.orders],
  })),
  
  updateOrder: (id, orderUpdate) => set((state) => ({
    orders: state.orders.map((o) => 
      o.id === id ? { ...o, ...orderUpdate } : o
    ),
  })),
  
  removeOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id),
  })),
  
  setPositions: (positions) => set({ positions }),
  
  updatePosition: (id, positionUpdate) => set((state) => ({
    positions: state.positions.map((p) => 
      p.id === id ? { ...p, ...positionUpdate } : p
    ),
  })),
  
  setTrades: (trades) => set({ trades }),
  
  addTrade: (trade) => set((state) => ({
    trades: [trade, ...state.trades],
  })),
  
  setSignals: (signals) => set({ signals }),
  
  addSignal: (signal) => set((state) => ({
    signals: [signal, ...state.signals],
  })),
  
  setSelectedOrderTab: (tab) => set({ selectedOrderTab: tab }),
}));