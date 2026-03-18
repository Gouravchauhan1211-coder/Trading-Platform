// Market Types
export interface Stock {
  symbol: string;
  name: string;
  ltp: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface NSESymbol {
  id: string;
  symbol: string;
  companyName: string;
  series?: string;
  listingDate?: string;
  paidUpValue?: number;
  marketLot?: number;
  isinCode?: string;
  faceValue?: number;
  stockExchange: string;
  lastUpdated?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  symbols: string[];
}

// Order Types
export type OrderType = 'MARKET' | 'LIMIT' | 'SL' | 'SLM';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'REJECTED';
export type ProductType = 'CNC' | 'MIS' | 'NRML';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopLoss?: number;
  status: OrderStatus;
  createdAt: string;
  executedAt?: string;
  productType: ProductType;
}

export interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  side: 'LONG' | 'SHORT';
}

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  timestamp: string;
}

export interface Signal {
  id: string;
  symbol: string;
  type: 'ENTRY' | 'EXIT';
  direction: 'LONG' | 'SHORT';
  price: number;
  timestamp: string;
  strategy: string;
}

// Portfolio Types
export interface PortfolioHolding {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  ltp: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  dayPnL: number;
  dayPnLPercent: number;
}

// Alert Types
export type AlertType = 'PRICE' | 'INDICATOR' | 'STRATEGY' | 'PORTFOLIO' | 'SYSTEM';
export type AlertStatus = 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';

export interface Alert {
  id: string;
  type: AlertType;
  symbol?: string;
  condition: string;
  value: number;
  status: AlertStatus;
  createdAt: string;
  triggeredAt?: string;
  message: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'FREE' | 'PRO' | 'PREMIUM';
  createdAt: string;
}

// Strategy Types
export interface Strategy {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  type: string;
  createdAt: string;
  lastRun?: string;
  signals: number;
}

// Chart Types
export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}