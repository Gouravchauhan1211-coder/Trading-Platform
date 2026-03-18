import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { usePortfolioStore, useOrderStore, useStrategyStore, useMarketStore } from '../store';
import { marketApi } from '../services/api';
import { TrendingUp, TrendingDown, Briefcase, Activity, FileText, Zap, ArrowRight, BarChart3, ListOrdered, Search } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StockSearch from '../components/trading/StockSearch';
import type { NSESymbol } from '../types';

// Mini Sparkline Component for stock ticker
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const chartData = data.map((value, index) => ({ index, value }));
  const color = positive ? '#22c55e' : '#ef4444';
  
  return (
    <ResponsiveContainer width={80} height={30}>
      <LineChart data={chartData}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={1.5} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Stock Ticker Card Component
function StockTickerCard({ symbol, name, price, change, changePercent, onClick }: { 
  symbol: string; 
  name: string; 
  price: number; 
  change: number; 
  changePercent: number;
  onClick: () => void;
}) {
  const isPositive = changePercent >= 0;
  
  // Generate sample sparkline data based on price
  const sparklineData = Array.from({ length: 10 }, () => 
    price * (1 + (Math.random() - 0.5) * 0.02)
  );
  
  return (
    <div 
      onClick={onClick}
      className="min-w-[200px] bg-white border border-panel-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-bold text-lg text-panel-900">{symbol}</div>
          <div className="text-xs text-panel-500 truncate max-w-[120px]">{name}</div>
        </div>
        <MiniSparkline data={sparklineData} positive={isPositive} />
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="font-bold text-xl text-panel-900">₹{price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
        <div className={`flex items-center text-sm font-medium ${isPositive ? 'text-buy-600' : 'text-sell-600'}`}>
          {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
}

// Market Index Card Component
interface MarketIndex {
  symbol: string;
  name: string;
  lastPrice: number;
  change: number;
  changePercent: number;
}

function MarketIndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.changePercent >= 0;
  
  return (
    <div className="bg-white border border-panel-200 rounded-xl p-4 min-w-[180px]">
      <div className="text-sm text-panel-500 mb-1">{index.name}</div>
      <div className="font-bold text-xl text-panel-900">
        {index.lastPrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 'N/A'}
      </div>
      <div className={`flex items-center text-sm font-medium mt-1 ${isPositive ? 'text-buy-600' : 'text-sell-600'}`}>
        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {isPositive ? '+' : ''}{index.change?.toFixed(2) || '0.00'} ({index.changePercent?.toFixed(2) || '0.00'}%)
      </div>
    </div>
  );
}

// Active Stock Row Component
interface ActiveStock {
  symbol: string;
  lastPrice: number;
  volume: number;
}

function ActiveStockRow({ stock, type }: { stock: ActiveStock; type: 'volume' | 'value' }) {
  const value = stock.lastPrice && stock.volume ? stock.lastPrice * stock.volume : 0;
  
  return (
    <tr className="border-b border-panel-100 last:border-0">
      <td className="py-2 px-2">
        <div className="font-medium text-panel-900">{stock.symbol}</div>
      </td>
      <td className="py-2 px-2 text-right">
        <span className="font-medium text-panel-900">
          {type === 'volume' 
            ? (stock.volume ? (stock.volume / 10000000).toFixed(2) + ' Cr' : 'N/A')
            : '₹' + (value / 10000000).toFixed(2) + ' Cr'
          }
        </span>
      </td>
    </tr>
  );
}

// Market Mover Stock Component
interface MarketMover {
  symbol: string;
  lastPrice: number;
  closePrice: number;
}

function MarketMoverCard({ stock, type }: { stock: MarketMover; type: 'gainer' | 'loser' }) {
  const change = stock.lastPrice && stock.closePrice ? stock.lastPrice - stock.closePrice : 0;
  const changePercent = stock.closePrice && stock.closePrice > 0 ? (change / stock.closePrice) * 100 : 0;
  const isPositive = type === 'gainer';
  
  return (
    <tr className="border-b border-panel-100 last:border-0">
      <td className="py-2">
        <div className="font-medium text-panel-900">{stock.symbol}</div>
      </td>
      <td className="py-2 text-right">
        <div className="font-medium text-panel-900">₹{stock.lastPrice?.toFixed(2) || 'N/A'}</div>
      </td>
      <td className="py-2 text-right">
        <span className={`font-medium ${isPositive ? 'text-buy-600' : 'text-sell-600'}`}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      </td>
    </tr>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { summary, holdings } = usePortfolioStore();
  const { positions, signals } = useOrderStore();
  const { strategies } = useStrategyStore();
  const { stocks } = useMarketStore();
  
  // State for market data from API
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [activeByVolume, setActiveByVolume] = useState<ActiveStock[]>([]);
  const [activeByValue, setActiveByValue] = useState<ActiveStock[]>([]);
  const [topGainers, setTopGainers] = useState<MarketMover[]>([]);
  const [topLosers, setTopLosers] = useState<MarketMover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState<NSESymbol | null>(null);
  
  // Handle stock selection from search
  
  // Fetch market data from API
  useEffect(() => {
    const fetchMarketData = async () => {
      setIsLoading(true);
      try {
        // Fetch indices
        const indicesData = await marketApi.getIndices();
        if (Array.isArray(indicesData)) {
          const indices = indicesData.map((item: any) => ({
            symbol: item.symbol,
            name: item.symbol,
            lastPrice: parseFloat(item.lastPrice) || 0,
            change: parseFloat(item.lastPrice) - parseFloat(item.closePrice) || 0,
            changePercent: ((parseFloat(item.lastPrice) - parseFloat(item.closePrice)) / parseFloat(item.closePrice)) * 100 || 0
          }));
          setMarketIndices(indices);
        }
        
        // Fetch most active by volume
        const volumeData = await marketApi.getMostActive('volume');
        if (Array.isArray(volumeData)) {
          setActiveByVolume(volumeData.map((item: any) => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice) || 0,
            volume: parseInt(item.volume) || 0
          })));
        }
        
        // Fetch most active by value
        const valueData = await marketApi.getMostActive('value');
        if (Array.isArray(valueData)) {
          setActiveByValue(valueData.map((item: any) => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice) || 0,
            volume: parseInt(item.volume) || 0
          })));
        }
        
        // Fetch gainers
        const gainersData = await marketApi.getMovers('gainers');
        if (Array.isArray(gainersData)) {
          setTopGainers(gainersData.map((item: any) => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice) || 0,
            closePrice: parseFloat(item.closePrice) || 0
          })));
        }
        
        // Fetch losers
        const losersData = await marketApi.getMovers('losers');
        if (Array.isArray(losersData)) {
          setTopLosers(losersData.map((item: any) => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice) || 0,
            closePrice: parseFloat(item.closePrice) || 0
          })));
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        // Use fallback sample data on error
        setMarketIndices([
          { symbol: 'NIFTY', name: 'NIFTY 50', lastPrice: 23151.10, change: -488.05, changePercent: -2.06 },
          { symbol: 'BANKNIFTY', name: 'BANKNIFTY', lastPrice: 53757.85, change: -1343.10, changePercent: -2.44 },
          { symbol: 'SENSEX', name: 'SENSEX', lastPrice: 74563.92, change: -1470.50, changePercent: -1.93 },
          { symbol: 'NIFTYMIDCAP', name: 'NIFTY MIDCAP', lastPrice: 54761.10, change: -1492.65, changePercent: -2.65 },
        ]);
        setActiveByVolume([
          { symbol: 'IDEA', lastPrice: 0, volume: 570944045 },
          { symbol: 'IFCI', lastPrice: 0, volume: 217069799 },
          { symbol: 'NTPCGREEN', lastPrice: 0, volume: 177681435 },
          { symbol: 'SEPC', lastPrice: 0, volume: 103596898 },
          { symbol: 'YESBANK', lastPrice: 0, volume: 94002650 },
        ]);
        setActiveByValue([
          { symbol: 'LT', lastPrice: 3706810000, volume: 0 },
          { symbol: 'HDFCBANK', lastPrice: 3406930000, volume: 0 },
          { symbol: 'RELIANCE', lastPrice: 2383790000, volume: 0 },
          { symbol: 'ICICIBANK', lastPrice: 2176370000, volume: 0 },
          { symbol: 'M&M', lastPrice: 2115560000, volume: 0 },
        ]);
        setTopGainers([
          { symbol: 'ARYAMAN', lastPrice: 440.00, closePrice: 403.50 },
          { symbol: 'AKI', lastPrice: 4.77, closePrice: 4.47 },
          { symbol: 'SHYAMINV', lastPrice: 12.00, closePrice: 11.25 },
          { symbol: 'ORIENTLTD', lastPrice: 69.90, closePrice: 65.57 },
          { symbol: 'KREON', lastPrice: 33.52, closePrice: 31.35 },
        ]);
        setTopLosers([
          { symbol: 'SUNSKY', lastPrice: 70.50, closePrice: 77.37 },
          { symbol: 'DHANLAX', lastPrice: 56.00, closePrice: 59.67 },
          { symbol: 'SHARMAH', lastPrice: 82.04, closePrice: 87.36 },
          { symbol: 'ACKNIT', lastPrice: 253.30, closePrice: 267.23 },
          { symbol: 'USGTECH', lastPrice: 8.50, closePrice: 8.97 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
  }, []);
  
  // Convert stocks object to array
  const stockList = Object.values(stocks);
  
  // Sample equity curve data
  const equityData = [
    { day: '1', value: 850000 },
    { day: '2', value: 855000 },
    { day: '3', value: 852000 },
    { day: '4', value: 858000 },
    { day: '5', value: 860000 },
    { day: '6', value: 862000 },
    { day: '7', value: 863051 },
  ];
  
  // Allocation data for pie chart
  const allocationData = holdings.map(h => ({
    name: h.symbol,
    value: h.allocation,
  }));
  
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const activeStrategies = strategies.filter(s => s.status === 'ACTIVE').length;
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-panel-900">Dashboard</h1>
        <button 
          onClick={() => navigate('/trading')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          View All Markets <ArrowRight size={18} />
        </button>
      </div>
      
      {/* Stock Search Section */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-panel-900">Search Stocks</h3>
        </div>
        <StockSearch 
          onSelectStock={(stock) => {
            setSelectedStock(stock);
            // Navigate to trading page with selected symbol
            navigate('/trading', { state: { symbol: stock.symbol } });
          }}
          placeholder="Search NSE stocks by symbol or company name..."
        />
        {selectedStock && (
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-panel-600">
              Selected: <span className="font-semibold text-panel-900">{selectedStock.symbol}</span> 
              - {selectedStock.companyName}
            </p>
          </div>
        )}
      </div>
      
      {/* Top Row: Portfolio Value & Daily PnL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Briefcase className="text-primary-600" size={24} />
            </div>
            <span className="text-panel-600">Portfolio Value</span>
          </div>
          <div className="text-3xl font-bold text-panel-900">
            ₹{summary.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div className={`text-sm mt-1 ${
            summary.totalPnL >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.totalPnL >= 0 ? '+' : ''}₹{summary.totalPnL.toFixed(2)} ({summary.totalPnLPercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${summary.dayPnL >= 0 ? 'bg-buy-100' : 'bg-sell-100'} rounded-lg`}>
              {summary.dayPnL >= 0 ? (
                <TrendingUp className="text-buy-600" size={24} />
              ) : (
                <TrendingDown className="text-sell-600" size={24} />
              )}
            </div>
            <span className="text-panel-600">Daily PnL</span>
          </div>
          <div className={`text-3xl font-bold ${
            summary.dayPnL >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.dayPnL >= 0 ? '+' : ''}₹{summary.dayPnL.toFixed(2)}
          </div>
          <div className={`text-sm mt-1 ${
            summary.dayPnLPercent >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.dayPnLPercent >= 0 ? '+' : ''}{summary.dayPnLPercent.toFixed(2)}% today
          </div>
        </div>
      </div>
      
      {/* Market Indices Section */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={20} className="text-primary-600" />
          <h3 className="text-lg font-semibold text-panel-900">Market Indices</h3>
          {isLoading && <span className="text-xs text-panel-500 ml-2">Loading...</span>}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {marketIndices.length > 0 ? (
            marketIndices.map((index) => (
              <MarketIndexCard key={index.symbol} index={index} />
            ))
          ) : !isLoading && (
            <div className="text-panel-500 p-4">No indices data available</div>
          )}
        </div>
      </div>
      
      {/* Stock Ticker - Horizontal Scroll */}
      <div className="card p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-panel-900">Market Overview</h3>
          <span className="text-xs text-panel-500">Click on a stock to view details</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {stockList.map((stock) => (
            <StockTickerCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.ltp}
              change={stock.change}
              changePercent={stock.changePercent}
              onClick={() => navigate('/trading', { state: { symbol: stock.symbol } })}
            />
          ))}
        </div>
      </div>
      
      {/* Second Row: Equity Curve & Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-panel-900 mb-4">Equity Curve</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={equityData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip 
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0' }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-panel-900 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-primary-600" />
            Open Positions
          </h3>
          <div className="space-y-2">
            {positions.slice(0, 5).map((pos) => (
              <div key={pos.id} className="flex items-center justify-between py-2 border-b border-panel-100 last:border-0">
                <div>
                  <div className="font-medium text-panel-900">{pos.symbol}</div>
                  <div className="text-sm text-panel-500">{pos.quantity} shares</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${pos.pnl >= 0 ? 'text-buy-600' : 'text-sell-600'}`}>
                    {pos.pnl >= 0 ? '+' : ''}₹{pos.pnl.toFixed(2)}
                  </div>
                  <div className={`text-sm ${pos.pnlPercent >= 0 ? 'text-buy-600' : 'text-sell-600'}`}>
                    {pos.pnlPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
            {positions.length === 0 && (
              <div className="text-center text-panel-500 py-4">No open positions</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Third Row: Most Active Stocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <ListOrdered size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-panel-900">Most Active - Volume</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {activeByVolume.length > 0 ? (
                  activeByVolume.slice(0, 5).map((stock) => (
                    <ActiveStockRow key={stock.symbol} stock={stock} type="volume" />
                  ))
                ) : !isLoading && (
                  <tr><td className="py-4 text-center text-panel-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-primary-600" />
            <h3 className="text-lg font-semibold text-panel-900">Most Active - Value (₹ Cr)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {activeByValue.length > 0 ? (
                  activeByValue.slice(0, 5).map((stock) => (
                    <ActiveStockRow key={stock.symbol} stock={stock} type="value" />
                  ))
                ) : !isLoading && (
                  <tr><td className="py-4 text-center text-panel-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Fourth Row: Recent Signals & Strategy Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-panel-900 mb-4 flex items-center gap-2">
            <Zap size={20} className="text-signal-600" />
            Recent Signals
          </h3>
          <div className="space-y-2">
            {signals.slice(0, 5).map((signal) => (
              <div key={signal.id} className="flex items-center justify-between py-2 border-b border-panel-100 last:border-0">
                <div>
                  <div className="font-medium text-panel-900">{signal.symbol}</div>
                  <div className="text-sm text-panel-500">{signal.strategy}</div>
                </div>
                <div className="text-right">
                  <span className={`signal-badge`}>
                    {signal.direction}
                  </span>
                  <div className="text-sm text-panel-500 mt-1">
                    {signal.type}
                  </div>
                </div>
              </div>
            ))}
            {signals.length === 0 && (
              <div className="text-center text-panel-500 py-4">No signals</div>
            )}
          </div>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-panel-900 mb-4 flex items-center gap-2">
            <FileText size={20} className="text-primary-600" />
            Strategy Status
          </h3>
          <div className="space-y-3">
            {strategies.slice(0, 5).map((strategy) => (
              <div key={strategy.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-panel-900">{strategy.name}</div>
                  <div className="text-sm text-panel-500">{strategy.type}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  strategy.status === 'ACTIVE' 
                    ? 'bg-buy-100 text-buy-700'
                    : strategy.status === 'PAUSED'
                    ? 'bg-alert-100 text-alert-700'
                    : 'bg-panel-200 text-panel-600'
                }`}>
                  {strategy.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-panel-200">
            <div className="text-sm text-panel-600">
              Active Strategies: <span className="font-semibold text-panel-900">{activeStrategies}</span> / {strategies.length}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fifth Row: Market Movers (Gainers & Losers) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-buy-600" />
            <h3 className="text-lg font-semibold text-panel-900">Top Gainers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {topGainers.length > 0 ? (
                  topGainers.slice(0, 5).map((stock) => (
                    <MarketMoverCard key={stock.symbol} stock={stock} type="gainer" />
                  ))
                ) : !isLoading && (
                  <tr><td className="py-4 text-center text-panel-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={20} className="text-sell-600" />
            <h3 className="text-lg font-semibold text-panel-900">Top Losers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {topLosers.length > 0 ? (
                  topLosers.slice(0, 5).map((stock) => (
                    <MarketMoverCard key={stock.symbol} stock={stock} type="loser" />
                  ))
                ) : !isLoading && (
                  <tr><td className="py-4 text-center text-panel-500">No data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Sixth Row: Portfolio Allocation */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-panel-900 mb-4">Portfolio Allocation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {allocationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value}%`, 'Allocation']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 items-center">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 px-3 py-2 bg-panel-50 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm font-medium text-panel-700">{entry.name}</span>
                <span className="text-sm text-panel-500">{entry.value}%</span>
              </div>
            ))}
            {allocationData.length === 0 && (
              <div className="text-panel-500">No holdings</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
