import { useState, useEffect } from 'react';
import { Activity, RefreshCw, X, AlertCircle, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { tradeApi } from '../services/api';

interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: string;
  executedAt: string;
}

export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active'>('all');

  useEffect(() => {
    loadTrades();
  }, []);

  const loadTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allTrades, active] = await Promise.all([
        tradeApi.getTrades(0, 50),
        tradeApi.getActiveTrades()
      ]);
      setTrades(allTrades.content || allTrades || []);
      setActiveTrades(active || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    try {
      await tradeApi.cancelTrade(tradeId);
      loadTrades();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel trade');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return 'text-buy-600 bg-buy-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED':
        return 'text-panel-600 bg-panel-100';
      case 'REJECTED':
        return 'text-sell-600 bg-sell-100';
      default:
        return 'text-panel-600 bg-panel-100';
    }
  };

  const displayTrades = activeTab === 'all' ? trades : activeTrades;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-panel-900">Trades</h1>
        <button
          onClick={loadTrades}
          className="p-2 hover:bg-panel-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={20} className="text-panel-600" />
        </button>
      </div>

      {error && (
        <div className="bg-sell-100 border border-sell-300 text-sell-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-panel-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          All Trades
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'active'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Active Trades ({activeTrades.length})
        </button>
      </div>

      {/* Trades Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-panel-50">
            <tr>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Symbol</th>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Side</th>
              <th className="text-right px-4 py-3 text-panel-600 font-medium">Quantity</th>
              <th className="text-right px-4 py-3 text-panel-600 font-medium">Price</th>
              <th className="text-right px-4 py-3 text-panel-600 font-medium">Value</th>
              <th className="text-center px-4 py-3 text-panel-600 font-medium">Status</th>
              <th className="text-left px-4 py-3 text-panel-600 font-medium">Executed At</th>
              <th className="text-center px-4 py-3 text-panel-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-panel-100">
            {displayTrades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-panel-500">
                  No trades found
                </td>
              </tr>
            ) : (
              displayTrades.map((trade) => (
                <tr key={trade.id} className="hover:bg-panel-50">
                  <td className="px-4 py-3 font-medium text-panel-900">{trade.symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 ${
                      trade.side === 'BUY' ? 'text-buy-600' : 'text-sell-600'
                    }`}>
                      {trade.side === 'BUY' ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                      {trade.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-panel-900">{trade.quantity}</td>
                  <td className="px-4 py-3 text-right text-panel-900">
                    ₹{trade.price.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-right text-panel-900">
                    ₹{(trade.quantity * trade.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-panel-600">
                    {new Date(trade.executedAt).toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {trade.status === 'PENDING' && (
                      <button
                        onClick={() => handleCancelTrade(trade.id)}
                        className="p-1 hover:bg-sell-100 rounded transition-colors"
                        title="Cancel Trade"
                      >
                        <X size={16} className="text-sell-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-sm text-panel-600">Total Trades</div>
          <div className="text-xl font-bold text-panel-900">{trades.length}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-panel-600">Buy Trades</div>
          <div className="text-xl font-bold text-buy-600">
            {trades.filter(t => t.side === 'BUY').length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-panel-600">Sell Trades</div>
          <div className="text-xl font-bold text-sell-600">
            {trades.filter(t => t.side === 'SELL').length}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-panel-600">Total Value</div>
          <div className="text-xl font-bold text-panel-900">
            ₹{trades.reduce((sum, t) => sum + (t.quantity * t.price), 0).toLocaleString('en-IN')}
          </div>
        </div>
      </div>
    </div>
  );
}
