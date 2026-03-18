import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  filterType: string;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, alertUpdate: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  setFilterType: (type: string) => void;
}

// Sample alerts
const sampleAlerts: Alert[] = [
  {
    id: '1',
    type: 'PRICE',
    symbol: 'RELIANCE',
    condition: 'Above',
    value: 2900,
    status: 'ACTIVE',
    createdAt: '2024-01-15T10:00:00Z',
    message: 'Alert when RELIANCE goes above ₹2900',
  },
  {
    id: '2',
    type: 'PRICE',
    symbol: 'INFY',
    condition: 'Below',
    value: 1480,
    status: 'ACTIVE',
    createdAt: '2024-01-15T09:30:00Z',
    message: 'Alert when INFY goes below ₹1480',
  },
  {
    id: '3',
    type: 'INDICATOR',
    symbol: 'TCS',
    condition: 'RSI > 70',
    value: 70,
    status: 'TRIGGERED',
    createdAt: '2024-01-14T14:00:00Z',
    triggeredAt: '2024-01-15T10:30:00Z',
    message: 'RSI indicator for TCS crossed 70',
  },
  {
    id: '4',
    type: 'STRATEGY',
    symbol: 'HDFCBANK',
    condition: 'MA Crossover',
    value: 0,
    status: 'ACTIVE',
    createdAt: '2024-01-14T11:00:00Z',
    message: 'Moving Average Crossover signal for HDFCBANK',
  },
  {
    id: '5',
    type: 'PORTFOLIO',
    condition: 'Daily PnL < -2%',
    value: -2,
    status: 'ACTIVE',
    createdAt: '2024-01-13T09:00:00Z',
    message: 'Alert when daily portfolio loss exceeds 2%',
  },
  {
    id: '6',
    type: 'SYSTEM',
    condition: 'Connection Lost',
    value: 0,
    status: 'DISMISSED',
    createdAt: '2024-01-12T16:00:00Z',
    message: 'WebSocket connection was restored',
  },
];

export const useAlertStore = create<AlertState>((set) => ({
  alerts: sampleAlerts,
  filterType: 'ALL',

  setAlerts: (alerts) => set({ alerts }),
  
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
  })),
  
  updateAlert: (id, alertUpdate) => set((state) => ({
    alerts: state.alerts.map((a) => 
      a.id === id ? { ...a, ...alertUpdate } : a
    ),
  })),
  
  removeAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id),
  })),
  
  setFilterType: (type) => set({ filterType: type }),
}));