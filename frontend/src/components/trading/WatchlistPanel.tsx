import { useState } from 'react';
import { useMarketStore } from '../../store';
import { Star, Plus, Trash2 } from 'lucide-react';

interface WatchlistPanelProps {
  selectedSymbol: string | null;
  onSelectSymbol: (symbol: string | null) => void;
}

export default function WatchlistPanel({ selectedSymbol, onSelectSymbol }: WatchlistPanelProps) {
  const { stocks, watchlists } = useMarketStore();
  const [activeWatchlist, setActiveWatchlist] = useState(watchlists[0]?.id || '1');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const currentWatchlist = watchlists.find(w => w.id === activeWatchlist);
  const watchlistSymbols = currentWatchlist?.symbols || [];
  
  return (
    <div className="h-full flex flex-col bg-white border border-panel-200 rounded-lg">
      {/* Watchlist Tabs */}
      <div className="flex items-center gap-1 p-2 border-b border-panel-200 overflow-x-auto">
        {watchlists.map((watchlist) => (
          <button
            key={watchlist.id}
            onClick={() => setActiveWatchlist(watchlist.id)}
            className={`px-3 py-1 text-sm rounded whitespace-nowrap ${
              activeWatchlist === watchlist.id
                ? 'bg-primary-100 text-primary-700'
                : 'text-panel-600 hover:bg-panel-50'
            }`}
          >
            {watchlist.name}
          </button>
        ))}
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1 hover:bg-panel-100 rounded"
        >
          <Plus size={16} className="text-panel-500" />
        </button>
      </div>
      
      {/* Stock List */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-white">
            <tr className="text-left text-xs text-panel-500 uppercase">
              <th className="px-3 py-2 font-medium">Symbol</th>
              <th className="px-3 py-2 font-medium text-right">LTP</th>
              <th className="px-3 py-2 font-medium text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {watchlistSymbols.map((symbol) => {
              const stock = stocks[symbol];
              if (!stock) return null;
              
              return (
                <tr
                  key={symbol}
                  onClick={() => onSelectSymbol(symbol)}
                  className={`cursor-pointer hover:bg-panel-50 ${
                    selectedSymbol === symbol ? 'bg-primary-50' : ''
                  }`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-panel-400" />
                      <span className="font-medium text-panel-900">{symbol}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-panel-900">
                    ₹{stock.ltp.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2 text-right text-sm ${
                    stock.changePercent >= 0 ? 'text-buy-600' : 'text-sell-600'
                  }`}>
                    {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}