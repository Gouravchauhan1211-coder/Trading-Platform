// Trading Platform API Service
// All endpoints connect to real backend services via nginx proxy

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Create headers with authentication
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Generic API client for making requests
const api = {
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `API request failed: ${response.statusText}`);
    }
    return response.json();
  },
};

export default api;

// ============================================
// AUTH API - User Service (Port 8081)
// ============================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error('Login failed: Invalid credentials');
    }
    const data = await response.json();
    // Store token
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  logout: async () => {
    localStorage.removeItem('auth_token');
  },

  validateToken: async (): Promise<{ valid: boolean }> => {
    const token = getAuthToken();
    if (!token) {
      return { valid: false };
    }
    try {
      const response = await fetch('/api/users/validate', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return { valid: response.ok };
    } catch {
      return { valid: false };
    }
  },

  getCurrentUser: async () => {
    const response = await fetch('/api/users/me', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    return response.json();
  },
};

// ============================================
// MARKET DATA API - Market Data Service (Port 8082)
// ============================================
export const marketApi = {
  getMarketData: async () => {
    const response = await fetch('/market/api/market-data', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch market data');
    }
    return response.json();
  },

  getSymbols: async () => {
    const response = await fetch('/market/api/market-data/symbols', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }
    return response.json();
  },

  getIndices: async () => {
    const response = await fetch('/market/api/market-data/indices', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch indices');
    }
    return response.json();
  },

  getMostActive: async (sortBy: string = 'volume') => {
    const response = await fetch(`/market/api/market-data/most-active?sortBy=${sortBy}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch most active');
    }
    return response.json();
  },

  getMovers: async (type: string = 'gainers') => {
    const response = await fetch(`/market/api/market-data/movers?type=${type}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch movers');
    }
    return response.json();
  },

  searchStocks: async (query: string) => {
    const response = await fetch(`/market/api/market-data/stocks/search?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to search stocks');
    }
    return response.json();
  },

  getAllStocks: async () => {
    const response = await fetch('/market/api/market-data/stocks/all', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch all stocks');
    }
    return response.json();
  },

  getStockBySymbol: async (symbol: string) => {
    const response = await fetch(`/market/api/market-data/stocks/${encodeURIComponent(symbol)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stock');
    }
    return response.json();
  },

  getStockSuggestions: async (prefix: string, limit: number = 10) => {
    const response = await fetch(`/market/api/market-data/stocks/suggestions?prefix=${encodeURIComponent(prefix)}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch stock suggestions');
    }
    return response.json();
  },

  getQuotes: async (symbols: string[]) => {
    const response = await fetch(`/market/api/market-data/quotes?symbols=${symbols.join(',')}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch quotes');
    }
    return response.json();
  },
};

// ============================================
// NEWS API - Market Data Service (Port 8082)
// ============================================
export const newsApi = {
  getNews: async () => {
    const response = await fetch('/market/api/news', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }
    return response.json();
  },

  getTrending: async () => {
    const response = await fetch('/market/api/news/trending', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trending news');
    }
    return response.json();
  },

  getNewsByCategory: async (category: string) => {
    const response = await fetch(`/market/api/news?category=${encodeURIComponent(category)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch news by category');
    }
    return response.json();
  },
};

// ============================================
// ETF API - Market Data Service (Port 8082)
// ============================================
export const etfApi = {
  getAllETFs: async () => {
    const response = await fetch('/market/api/etf', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch ETFs');
    }
    return response.json();
  },

  getETFBySymbol: async (symbol: string) => {
    const response = await fetch(`/market/api/etf/${encodeURIComponent(symbol)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch ETF');
    }
    return response.json();
  },
};

// ============================================
// IPO API - Market Data Service (Port 8082)
// ============================================
export const ipoApi = {
  getIpoData: async () => {
    const response = await fetch('/market/api/ipo', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch IPO data');
    }
    return response.json();
  },
};

// ============================================
// COMMODITIES API - Market Data Service (Port 8082)
// ============================================
export const commodityApi = {
  getCommodities: async () => {
    const response = await fetch('/market/api/commodities', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch commodities');
    }
    return response.json();
  },
};

// ============================================
// MUTUAL FUNDS API - Market Data Service (Port 8082)
// ============================================
export const mfApi = {
  getMutualFunds: async () => {
    const response = await fetch('/market/api/mutual-funds', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch mutual funds');
    }
    return response.json();
  },

  searchFunds: async (query: string) => {
    const response = await fetch(`/market/api/mutual-funds?query=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to search funds');
    }
    return response.json();
  },
};

// ============================================
// ORDER API - Order Service (Port 8084)
// ============================================
export interface OrderRequest {
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  exchange?: string;
}

export interface OrderResponse {
  orderId: string;
  symbol: string;
  side: string;
  type: string;
  quantity: number;
  price?: number;
  status: string;
  errorMessage?: string;
  createdAt?: string;
}

export const orderApi = {
  createOrder: async (order: OrderRequest): Promise<OrderResponse> => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create order');
    }
    return response.json();
  },

  getOrders: async () => {
    const response = await fetch('/api/orders', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  getOrder: async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }
    return response.json();
  },

  cancelOrder: async (orderId: string) => {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to cancel order');
    }
    return response.json();
  },

  getTradingMode: async () => {
    const response = await fetch('/api/orders/mode', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trading mode');
    }
    return response.json();
  },
};

// ============================================
// PORTFOLIO API - Portfolio Service (Port 8085)
// ============================================
export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnl: number;
}

export interface Portfolio {
  totalValue: number;
  unrealizedPnL: number;
  positions: Position[];
}

export const portfolioApi = {
  getPortfolio: async (): Promise<Portfolio> => {
    const response = await fetch('/portfolio/api/portfolio', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio');
    }
    return response.json();
  },

  getPositions: async (): Promise<Position[]> => {
    const response = await fetch('/portfolio/api/portfolio/positions', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch positions');
    }
    return response.json();
  },

  getPortfolioSummary: async () => {
    const response = await fetch('/portfolio/api/portfolio/summary', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch portfolio summary');
    }
    return response.json();
  },
};

// ============================================
// STRATEGY API - Strategy Engine (Port 8083)
// ============================================
export interface Strategy {
  id: string;
  name: string;
  type: string;
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  config: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export const strategyApi = {
  getStrategies: async () => {
    const response = await fetch('/strategy/api/strategies', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch strategies');
    }
    return response.json();
  },

  getStrategy: async (id: string) => {
    const response = await fetch(`/strategy/api/strategies/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch strategy');
    }
    return response.json();
  },

  createStrategy: async (strategy: Partial<Strategy>) => {
    const response = await fetch('/strategy/api/strategies', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(strategy),
    });
    if (!response.ok) {
      throw new Error('Failed to create strategy');
    }
    return response.json();
  },

  updateStrategy: async (id: string, strategy: Partial<Strategy>) => {
    const response = await fetch(`/strategy/api/strategies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(strategy),
    });
    if (!response.ok) {
      throw new Error('Failed to update strategy');
    }
    return response.json();
  },

  startStrategy: async (id: string) => {
    const response = await fetch(`/strategy/api/strategies/${id}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to start strategy');
    }
    return response.json();
  },

  stopStrategy: async (id: string) => {
    const response = await fetch(`/strategy/api/strategies/${id}/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to stop strategy');
    }
    return response.json();
  },
};

// ============================================
// BACKTEST API - Backtesting Engine (Port 8087)
// ============================================
export interface BacktestConfig {
  symbol: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
}

export interface BacktestResult {
  id: string;
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
  };
  trades: any[];
  equityCurve: any[];
}

export const backtestApi = {
  runBacktest: async (config: BacktestConfig): Promise<BacktestResult> => {
    const response = await fetch('/api/backtest/run', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    });
    if (!response.ok) {
      throw new Error('Failed to run backtest');
    }
    return response.json();
  },

  getBacktestResult: async (id: string): Promise<BacktestResult> => {
    const response = await fetch(`/api/backtest/results/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch backtest result');
    }
    return response.json();
  },
};

// ============================================
// TRADE API - Trade Service (Port 8095)
// ============================================
export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  executedAt: string;
}

export const tradeApi = {
  getTrades: async (page: number = 0, size: number = 20) => {
    const response = await fetch(`/api/v1/trades?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trades');
    }
    return response.json();
  },

  getTrade: async (tradeId: string) => {
    const response = await fetch(`/api/v1/trades/${tradeId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trade');
    }
    return response.json();
  },

  getTradeByOrderId: async (orderId: string) => {
    const response = await fetch(`/api/v1/trades/order/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch trade by order');
    }
    return response.json();
  },

  getActiveTrades: async () => {
    const response = await fetch('/api/v1/trades/active', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch active trades');
    }
    return response.json();
  },

  cancelTrade: async (tradeId: string) => {
    const response = await fetch(`/api/v1/trades/${tradeId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to cancel trade');
    }
    return response.json();
  },
};

// ============================================
// FUNDS API - Funds Service (Port 8093)
// ============================================
export interface Wallet {
  id: string;
  balance: number;
  lockedBalance: number;
  availableBalance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRADE' | 'REFUND';
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  reference: string;
  createdAt: string;
}

export interface FundsLock {
  id: string;
  orderId: string;
  amount: number;
  status: 'LOCKED' | 'SETTLED' | 'RELEASED';
}

export const fundsApi = {
  // Wallet endpoints
  getWallet: async (): Promise<Wallet> => {
    const response = await fetch('/api/v1/funds/wallet', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch wallet');
    }
    return response.json();
  },

  getBalance: async () => {
    const response = await fetch('/api/v1/funds/wallet/balance', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch balance');
    }
    return response.json();
  },

  rebuildWallet: async () => {
    const response = await fetch('/api/v1/funds/wallet/rebuild', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to rebuild wallet');
    }
    return response.json();
  },

  // Transaction endpoints
  getTransactions: async (page: number = 0, size: number = 20) => {
    const response = await fetch(`/api/v1/funds/transactions?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  getTransaction: async (reference: string) => {
    const response = await fetch(`/api/v1/funds/transactions/${reference}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch transaction');
    }
    return response.json();
  },

  deposit: async (amount: number, paymentMethod: string) => {
    const response = await fetch('/api/v1/funds/deposit', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, paymentMethod }),
    });
    if (!response.ok) {
      throw new Error('Failed to initiate deposit');
    }
    return response.json();
  },

  confirmDeposit: async (reference: string) => {
    const response = await fetch('/api/v1/funds/deposit/confirm', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference }),
    });
    if (!response.ok) {
      throw new Error('Failed to confirm deposit');
    }
    return response.json();
  },

  withdraw: async (amount: number, bankAccount: string) => {
    const response = await fetch('/api/v1/funds/withdraw', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, bankAccount }),
    });
    if (!response.ok) {
      throw new Error('Failed to initiate withdrawal');
    }
    return response.json();
  },

  completeWithdrawal: async (reference: string) => {
    const response = await fetch('/api/v1/funds/withdraw/complete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reference }),
    });
    if (!response.ok) {
      throw new Error('Failed to complete withdrawal');
    }
    return response.json();
  },

  // Funds lock endpoints
  getActiveLocks: async (): Promise<FundsLock[]> => {
    const response = await fetch('/api/v1/funds/locks', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch active locks');
    }
    return response.json();
  },

  getLockByOrderId: async (orderId: string) => {
    const response = await fetch(`/api/v1/funds/locks/${orderId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch lock');
    }
    return response.json();
  },
};

// ============================================
// PAYMENT API - Payment Service (Port 8094)
// ============================================
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  method: string;
  reference: string;
  createdAt: string;
}

export const paymentApi = {
  initiatePayment: async (amount: number, currency: string = 'INR') => {
    const response = await fetch('/api/v1/payments/initiate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount, currency }),
    });
    if (!response.ok) {
      throw new Error('Failed to initiate payment');
    }
    return response.json();
  },

  verifyPayment: async (paymentId: string, razorpayPaymentId: string, razorpaySignature: string) => {
    const response = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ paymentId, razorpayPaymentId, razorpaySignature }),
    });
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    return response.json();
  },

  getPayment: async (id: string): Promise<Payment> => {
    const response = await fetch(`/api/v1/payments/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment');
    }
    return response.json();
  },

  getPaymentHistory: async (): Promise<Payment[]> => {
    const response = await fetch('/api/v1/payments/history', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }
    return response.json();
  },
};

// ============================================
// NOTIFICATION API - Notification Service
// ============================================
export interface NotificationPreference {
  type: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationChannel {
  type: string;
  enabled: boolean;
}

export const notificationApi = {
  getNotifications: async (page: number = 0, size: number = 20) => {
    const response = await fetch(`/api/v1/notifications?page=${page}&size=${size}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    return response.json();
  },

  getUnreadNotifications: async () => {
    const response = await fetch('/api/v1/notifications/unread', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch unread notifications');
    }
    return response.json();
  },

  getUnreadCount: async () => {
    const response = await fetch('/api/v1/notifications/count', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notification count');
    }
    return response.json();
  },

  deleteNotification: async (id: string) => {
    const response = await fetch(`/api/v1/notifications/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }
    return response.json();
  },

  // Preferences
  getPreferences: async () => {
    const response = await fetch('/api/v1/notifications/preferences', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notification preferences');
    }
    return response.json();
  },

  muteNotificationType: async (type: string, mute: boolean) => {
    const response = await fetch('/api/v1/notifications/preferences/mute-type', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, mute }),
    });
    if (!response.ok) {
      throw new Error('Failed to update notification preference');
    }
    return response.json();
  },

  muteAll: async () => {
    const response = await fetch('/api/v1/notifications/preferences/mute-all', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to mute all notifications');
    }
    return response.json();
  },

  unmuteAll: async () => {
    const response = await fetch('/api/v1/notifications/preferences/unmute-all', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to unmute all notifications');
    }
    return response.json();
  },

  // Channels
  getChannels: async () => {
    const response = await fetch('/api/v1/notifications/channels', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch notification channels');
    }
    return response.json();
  },

  updateChannelPreference: async (type: string, channels: string[]) => {
    const response = await fetch(`/api/v1/notifications/channels/${type}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ channels }),
    });
    if (!response.ok) {
      throw new Error('Failed to update channel preference');
    }
    return response.json();
  },
};

// ============================================
// REPORT API - Report Service
// ============================================
export interface Report {
  id: string;
  type: 'TRADE_SUMMARY' | 'PORTFOLIO' | 'TAX' | 'PERFORMANCE';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  startDate: string;
  endDate: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
}

export const reportApi = {
  createReport: async (type: string, startDate: string, endDate: string) => {
    const response = await fetch('/api/v1/reports', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ type, startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    return response.json();
  },

  getReport: async (reportId: string): Promise<Report> => {
    const response = await fetch(`/api/v1/reports/${reportId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch report');
    }
    return response.json();
  },

  getReports: async (): Promise<Report[]> => {
    const response = await fetch('/api/v1/reports', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  downloadReport: async (reportId: string) => {
    const response = await fetch(`/api/v1/reports/${reportId}/download`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    // Return blob for download
    return response.blob();
  },

  deleteReport: async (reportId: string) => {
    const response = await fetch(`/api/v1/reports/${reportId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
    return response.json();
  },
};

// ============================================
// RISK API - Risk Service (Port 8086)
// ============================================
export interface RiskLimits {
  maxPositionSize: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  maxLeverage: number;
}

export const riskApi = {
  getRiskLimits: async () => {
    const response = await fetch('/api/risk/limits', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch risk limits');
    }
    return response.json();
  },

  updateRiskLimits: async (limits: RiskLimits) => {
    const response = await fetch('/api/risk/limits', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(limits),
    });
    if (!response.ok) {
      throw new Error('Failed to update risk limits');
    }
    return response.json();
  },

  validateTrade: async (trade: { symbol: string; quantity: number; price: number; side: string }) => {
    const response = await fetch('/api/risk/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(trade),
    });
    if (!response.ok) {
      throw new Error('Failed to validate trade');
    }
    return response.json();
  },
};

// ============================================
// HISTORICAL DATA API
// ============================================
export const historicalApi = {
  getHistoricalData: async (symbol: string, period: string = '1Y') => {
    const response = await fetch(`/market/api/market-data/historical?symbol=${encodeURIComponent(symbol)}&period=${period}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }
    return response.json();
  },
};

// ============================================
// ALERT API
// ============================================
export interface Alert {
  id: string;
  type: 'PRICE' | 'INDICATOR' | 'STRATEGY' | 'PORTFOLIO' | 'SYSTEM';
  symbol?: string;
  condition: string;
  value: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';
  createdAt: string;
  triggeredAt?: string;
}

export const alertApi = {
  getAlerts: async () => {
    const response = await fetch('/api/alerts', {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to fetch alerts');
    }
    return response.json();
  },

  createAlert: async (alert: Partial<Alert>) => {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      throw new Error('Failed to create alert');
    }
    return response.json();
  },

  updateAlert: async (id: string, alert: Partial<Alert>) => {
    const response = await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(alert),
    });
    if (!response.ok) {
      throw new Error('Failed to update alert');
    }
    return response.json();
  },

  deleteAlert: async (id: string) => {
    const response = await fetch(`/api/alerts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Failed to delete alert');
    }
    return response.json();
  },
};


