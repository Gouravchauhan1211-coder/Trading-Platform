import { useState, useMemo } from 'react';
import { useMarketStore } from '../store';
import { Search, Filter, TrendingUp, BarChart2, TrendingDown } from 'lucide-react';

export default function Markets() {
  const { stocks, watchlists } = useMarketStore();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'heatmap' | 'screener'>('watchlist');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Screener filter states
  const [filterSector, setFilterSector] = useState('');
  const [filterMCap, setFilterMCap] = useState('');
  const [filterPE, setFilterPE] = useState('');
  const [filterChange, setFilterChange] = useState('');
  
  // Stock with additional data for screener
  const stockList = Object.values(stocks).filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Extended stock data with sector, market cap, P/E for screener
  const screenerStocks = useMemo(() => {
    const extendedStocks = stockList.map(stock => {
      // Assign mock sector based on symbol
      let sector = 'Other';
      const itStocks = ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM'];
      const financeStocks = ['HDFCBANK', 'ICICIBANK', 'SBIN', 'BAJFINANCE', 'KOTAKBANK'];
      const energyStocks = ['RELIANCE', 'ONGC', 'NTPC', 'POWERGRID'];
      const autoStocks = ['TATAMOTORS', 'MARUTI', 'M&M', 'BAJAJ-AUTO'];
      const pharmaStocks = ['SUNPHARMA', 'DRREDDY', 'CIPLA', 'DIVISLAB'];
      const fmcgStocks = ['HINDUNILVR', 'ITC', 'NESTLE', 'BRITANNIA'];
      
      if (itStocks.includes(stock.symbol)) sector = 'IT';
      else if (financeStocks.includes(stock.symbol)) sector = 'Banking';
      else if (energyStocks.includes(stock.symbol)) sector = 'Energy';
      else if (autoStocks.includes(stock.symbol)) sector = 'Auto';
      else if (pharmaStocks.includes(stock.symbol)) sector = 'Pharma';
      else if (fmcgStocks.includes(stock.symbol)) sector = 'FMCG';
      
      // Mock market cap (in Crores)
      let mcapCr = 0;
      if (['RELIANCE', 'TCS', 'HDFCBANK'].includes(stock.symbol)) mcapCr = 1500000; // Large cap
      else if (['INFY', 'ICICIBANK', 'SBIN', 'BAJFINANCE'].includes(stock.symbol)) mcapCr = 700000;
      else if (['WIPRO', 'SUNPHARMA', 'TATAMOTORS'].includes(stock.symbol)) mcapCr = 350000;
      else mcapCr = Math.random() * 50000 + 10000;
      
      // Mock P/E ratio
      const pe = stock.symbol === 'TATAMOTORS' ? 8.4 : 
                 stock.symbol === 'HINDUNILVR' ? 55.6 : 
                 stock.symbol === 'BAJFINANCE' ? 32.1 :
                 Math.random() * 40 + 10;
      
      return { ...stock, sector, mcapCr, pe, high52: stock.ltp * 1.15, low52: stock.ltp * 0.75 };
    });
    
    // Apply filters
    return extendedStocks.filter(stock => {
      // Sector filter
      if (filterSector && stock.sector !== filterSector) return false;
      
      // Market cap filter
      if (filterMCap === 'large' && stock.mcapCr < 200000) return false;
      if (filterMCap === 'mid' && (stock.mcapCr < 5000 || stock.mcapCr >= 200000)) return false;
      if (filterMCap === 'small' && stock.mcapCr >= 5000) return false;
      
      // P/E filter
      if (filterPE === 'under15' && stock.pe >= 15) return false;
      if (filterPE === 'under25' && stock.pe >= 25) return false;
      if (filterPE === 'over40' && stock.pe <= 40) return false;
      
      // Change filter
      if (filterChange === 'gainer' && stock.changePercent <= 0) return false;
      if (filterChange === 'loser' && stock.changePercent >= 0) return false;
      
      return true;
    });
  }, [stockList, filterSector, filterMCap, filterPE, filterChange]);
  
  // Mock sector data for heatmap
  const sectors = [
    { name: 'IT', change: 1.2, stocks: ['TCS', 'INFY', 'WIPRO'] },
    { name: 'Finance', change: 0.8, stocks: ['HDFCBANK', 'ICICIBANK', 'BAJFINANCE'] },
    { name: 'Energy', change: -0.5, stocks: ['RELIANCE'] },
    { name: 'Auto', change: 1.5, stocks: [] },
    { name: 'Pharma', change: -0.3, stocks: [] },
  ];
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-panel-900">Markets</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-panel-200">
        <button
          onClick={() => setActiveTab('watchlist')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'watchlist'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Watchlists
        </button>
        <button
          onClick={() => setActiveTab('heatmap')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'heatmap'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Heatmap
        </button>
        <button
          onClick={() => setActiveTab('screener')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'screener'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Screener
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-panel-400" size={20} />
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>
      
      {/* Content */}
      {activeTab === 'watchlist' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlists.map((watchlist) => (
            <div key={watchlist.id} className="card p-4">
              <h3 className="font-semibold text-panel-900 mb-3">{watchlist.name}</h3>
              <div className="space-y-2">
                {watchlist.symbols.map((symbol) => {
                  const stock = stocks[symbol];
                  if (!stock) return null;
                  return (
                    <div key={symbol} className="flex items-center justify-between py-2 border-b border-panel-100 last:border-0">
                      <div>
                        <div className="font-medium text-panel-900">{symbol}</div>
                        <div className="text-xs text-panel-500">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-panel-900">₹{stock.ltp.toFixed(2)}</div>
                        <div className={`text-xs ${stock.changePercent >= 0 ? 'text-buy-600' : 'text-sell-600'}`}>
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {activeTab === 'heatmap' && (
        <div className="card p-6">
          <h3 className="font-semibold text-panel-900 mb-4">Sector Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sectors.map((sector) => (
              <div 
                key={sector.name}
                className={`p-4 rounded-lg ${
                  sector.change >= 0 ? 'bg-buy-50' : 'bg-sell-50'
                }`}
              >
                <div className="font-semibold text-panel-900">{sector.name}</div>
                <div className={`text-lg font-bold ${
                  sector.change >= 0 ? 'text-buy-600' : 'text-sell-600'
                }`}>
                  {sector.change >= 0 ? '+' : ''}{sector.change}%
                </div>
                <div className="text-xs text-panel-500 mt-1">
                  {sector.stocks.length} stocks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {activeTab === 'screener' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-panel-500" size={18} />
                <span className="font-medium text-panel-900">Filters:</span>
              </div>
              
              <select 
                className="input w-auto"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
              >
                <option value="">All Sectors</option>
                <option>IT</option>
                <option>Banking</option>
                <option>FMCG</option>
                <option>Pharma</option>
                <option>Auto</option>
                <option>Energy</option>
                <option>Other</option>
              </select>
              
              <select 
                className="input w-auto"
                value={filterMCap}
                onChange={(e) => setFilterMCap(e.target.value)}
              >
                <option value="">All Market Caps</option>
                <option value="large">Large Cap (&gt;₹20,000 Cr)</option>
                <option value="mid">Mid Cap (₹5,000–20,000 Cr)</option>
                <option value="small">Small Cap (&lt;₹5,000 Cr)</option>
              </select>
              
              <select 
                className="input w-auto"
                value={filterPE}
                onChange={(e) => setFilterPE(e.target.value)}
              >
                <option value="">Any P/E</option>
                <option value="under15">P/E Under 15</option>
                <option value="under25">P/E Under 25</option>
                <option value="over40">P/E Over 40</option>
              </select>
              
              <select 
                className="input w-auto"
                value={filterChange}
                onChange={(e) => setFilterChange(e.target.value)}
              >
                <option value="">Any Change</option>
                <option value="gainer">Gainers only</option>
                <option value="loser">Losers only</option>
              </select>
              
              <div className="ml-auto text-sm text-panel-500">
                {screenerStocks.length} stocks found
              </div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-4">
              <BarChart2 className="text-panel-500" size={20} />
              <span className="font-medium text-panel-900">Stock Screener</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Symbol</th>
                    <th className="table-cell">Sector</th>
                    <th className="table-cell">Name</th>
                    <th className="table-cell text-right">LTP</th>
                    <th className="table-cell text-right">Change %</th>
                    <th className="table-cell text-right">Volume</th>
                    <th className="table-cell text-right">Mkt Cap (Cr)</th>
                    <th className="table-cell text-right">P/E</th>
                    <th className="table-cell text-right">52W High</th>
                    <th className="table-cell text-right">52W Low</th>
                  </tr>
                </thead>
                <tbody>
                  {screenerStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-panel-50 cursor-pointer">
                      <td className="table-cell font-medium">{stock.symbol}</td>
                      <td className="table-cell">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          stock.sector === 'IT' ? 'bg-blue-100 text-blue-700' :
                          stock.sector === 'Banking' ? 'bg-green-100 text-green-700' :
                          stock.sector === 'Energy' ? 'bg-yellow-100 text-yellow-700' :
                          stock.sector === 'Auto' ? 'bg-orange-100 text-orange-700' :
                          stock.sector === 'Pharma' ? 'bg-purple-100 text-purple-700' :
                          stock.sector === 'FMCG' ? 'bg-pink-100 text-pink-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {stock.sector}
                        </span>
                      </td>
                      <td className="table-cell text-panel-600">{stock.name}</td>
                      <td className="table-cell text-right">₹{stock.ltp.toFixed(2)}</td>
                      <td className={`table-cell text-right ${
                        stock.changePercent >= 0 ? 'text-buy-600' : 'text-sell-600'
                      }`}>
                        {stock.changePercent >= 0 ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </td>
                      <td className="table-cell text-right text-panel-600">
                        {(stock.volume / 1000000).toFixed(2)}M
                      </td>
                      <td className="table-cell text-right text-panel-600">
                        ₹{(stock.mcapCr / 10000).toFixed(1)}L Cr
                      </td>
                      <td className="table-cell text-right text-panel-600">
                        {stock.pe.toFixed(1)}
                      </td>
                      <td className="table-cell text-right text-panel-600">₹{stock.high52.toFixed(2)}</td>
                      <td className="table-cell text-right text-panel-600">₹{stock.low52.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}