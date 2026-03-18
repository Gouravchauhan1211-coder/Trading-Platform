import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw, BarChart3 } from 'lucide-react';
import { etfApi } from '../services/api';

interface ETF {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
}

export default function ETFs() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchETFs = async () => {
    setIsLoading(true);
    try {
      const data = await etfApi.getAllETFs();
      setEtfs(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch ETFs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchETFs();
    // Refresh every 5 minutes
    const interval = setInterval(fetchETFs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-panel-900">ETFs</h1>
          <p className="text-sm text-panel-500">Exchange Traded Funds - Real-time prices</p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-panel-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchETFs}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* ETF Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {etfs.map((etf) => {
          const isPositive = etf.changePercent >= 0;
          
          return (
            <div 
              key={etf.symbol} 
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg text-panel-900">{etf.symbol}</div>
                  <div className="text-xs text-panel-500 truncate max-w-[150px]">{etf.name}</div>
                </div>
                <div className={`p-2 rounded-lg ${isPositive ? 'bg-buy-100' : 'bg-sell-100'}`}>
                  {isPositive ? (
                    <TrendingUp size={20} className="text-buy-600" />
                  ) : (
                    <TrendingDown size={20} className="text-sell-600" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-panel-900">
                    ₹{etf.lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-buy-600' : 'text-sell-600'}`}>
                    {isPositive ? '+' : ''}{etf.changePercent.toFixed(2)}%
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs text-panel-500 pt-2 border-t border-panel-100">
                  <div>
                    <div className="text-panel-400">High</div>
                    <div className="font-medium text-panel-700">₹{etf.high.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-panel-400">Low</div>
                    <div className="font-medium text-panel-700">₹{etf.low.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-panel-400">Vol</div>
                    <div className="font-medium text-panel-700">{(etf.volume / 100000).toFixed(1)}L</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Popular ETFs Table */}
      <div className="card">
        <div className="flex items-center gap-2 p-4 border-b border-panel-100">
          <BarChart3 size={20} className="text-primary-600" />
          <h3 className="font-semibold text-panel-900">All ETFs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-panel-50">
                <th className="table-cell text-left">Symbol</th>
                <th className="table-cell text-left">Name</th>
                <th className="table-cell text-right">Price</th>
                <th className="table-cell text-right">Change</th>
                <th className="table-cell text-right">% Change</th>
                <th className="table-cell text-right">Open</th>
                <th className="table-cell text-right">High</th>
                <th className="table-cell text-right">Low</th>
                <th className="table-cell text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {etfs.map((etf) => (
                <tr key={etf.symbol} className="border-b border-panel-100 hover:bg-panel-50">
                  <td className="table-cell font-medium">{etf.symbol}</td>
                  <td className="table-cell text-panel-600">{etf.name}</td>
                  <td className="table-cell text-right font-medium">₹{etf.lastPrice.toFixed(2)}</td>
                  <td className={`table-cell text-right ${etf.change >= 0 ? 'text-buy-600' : 'text-sell-600'}`}>
                    {etf.change >= 0 ? '+' : ''}₹{etf.change.toFixed(2)}
                  </td>
                  <td className={`table-cell text-right ${etf.changePercent >= 0 ? 'text-buy-600' : 'text-sell-600'}`}>
                    {etf.changePercent >= 0 ? '+' : ''}{etf.changePercent.toFixed(2)}%
                  </td>
                  <td className="table-cell text-right text-panel-600">₹{etf.open.toFixed(2)}</td>
                  <td className="table-cell text-right text-panel-600">₹{etf.high.toFixed(2)}</td>
                  <td className="table-cell text-right text-panel-600">₹{etf.low.toFixed(2)}</td>
                  <td className="table-cell text-right text-panel-600">{(etf.volume / 100000).toFixed(1)}L</td>
                </tr>
              ))}
              {etfs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-panel-500">
                    No ETF data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
