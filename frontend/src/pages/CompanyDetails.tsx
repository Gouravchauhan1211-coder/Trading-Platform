import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMarketStore } from '../store';
import { Building2, TrendingUp, TrendingDown, BarChart3, Calendar, ArrowLeft, Plus, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CompanyFinancial {
  metric: string;
  fy21: string;
  fy22: string;
  fy23: string;
  fy24: string;
  ttm: string;
}

interface KeyRatio {
  label: string;
  value: string;
}

export default function CompanyDetails() {
  const navigate = useNavigate();
  const { symbol } = useParams();
  const { stocks } = useMarketStore();
  
  // Use symbol from params or default to RELIANCE
  const stockSymbol = symbol || 'RELIANCE';
  const stock = stocks[stockSymbol] || {
    symbol: stockSymbol,
    name: stockSymbol === 'RELIANCE' ? 'Reliance Industries' : 
          stockSymbol === 'TCS' ? 'Tata Consultancy Services' :
          stockSymbol === 'INFY' ? 'Infosys Ltd' :
          stockSymbol === 'HDFCBANK' ? 'HDFC Bank Ltd' : 'Company',
    ltp: 2850.50,
    change: 45.25,
    changePercent: 1.61,
    volume: 5234000,
    high: 3024.90,
    low: 2220.30,
    open: 2820.00,
    previousClose: 2805.25,
  };

  // Mock company data
  const companyData: Record<string, { sector: string; industry: string; marketCap: string; logoColor: string }> = {
    'RELIANCE': { sector: 'Energy', industry: 'Oil & Gas', marketCap: '₹19,28,430 Cr', logoColor: '#f5a623' },
    'TCS': { sector: 'IT', industry: 'Information Technology', marketCap: '₹13,13,840 Cr', logoColor: '#5b8af7' },
    'INFY': { sector: 'IT', industry: 'Information Technology', marketCap: '₹6,57,820 Cr', logoColor: '#5b8af7' },
    'HDFCBANK': { sector: 'Banking', industry: 'Financial Services', marketCap: '₹12,47,190 Cr', logoColor: '#00d084' },
  };

  const company = companyData[stockSymbol] || { sector: 'Other', industry: 'General', marketCap: '₹1,00,000 Cr', logoColor: '#64748b' };

  // Mock key ratios
  const keyRatios: KeyRatio[] = [
    { label: 'P/E Ratio', value: stockSymbol === 'TATAMOTORS' ? '8.4' : stockSymbol === 'HINDUNILVR' ? '55.6' : '24.8' },
    { label: 'P/B Ratio', value: '3.2' },
    { label: 'ROE', value: '15.4%' },
    { label: 'ROCE', value: '12.8%' },
    { label: 'Debt/Equity', value: '0.45' },
    { label: 'EPS (TTM)', value: '₹98.5' },
    { label: 'Dividend Yield', value: '0.8%' },
    { label: 'Book Value', value: '₹892' },
  ];

  // Mock financials data
  const financials: CompanyFinancial[] = [
    { metric: 'Revenue', fy21: '5,62,743', fy22: '7,92,756', fy23: '8,75,702', fy24: '9,36,480', ttm: '9,87,234' },
    { metric: 'EBITDA', fy21: '1,23,456', fy22: '1,56,789', fy23: '1,78,234', fy24: '1,92,456', ttm: '2,01,234' },
    { metric: 'Net Profit', fy21: '56,789', fy22: '67,890', fy23: '78,234', fy24: '89,567', ttm: '95,234' },
    { metric: 'Assets', fy21: '12,34,567', fy22: '13,45,678', fy23: '14,56,789', fy24: '15,67,890', ttm: '16,23,456' },
  ];

  // Mock price history for chart
  const priceHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    price: stock.ltp * (0.95 + Math.random() * 0.1)
  }));

  const isPositive = stock.changePercent >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-panel-100 rounded-lg"
        >
          <ArrowLeft size={20} className="text-panel-600" />
        </button>
        <h1 className="text-2xl font-bold text-panel-900">Company Details</h1>
      </div>

      {/* Company Hero */}
      <div className="card p-6">
        <div className="flex items-start gap-4 mb-6">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold"
            style={{ backgroundColor: company.logoColor }}
          >
            {stockSymbol.slice(0, 2)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-panel-900">{stock.name}</h2>
            <p className="text-panel-500">{company.sector} • {company.industry}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-panel-900">₹{stock.ltp.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
            <div className={`flex items-center justify-end text-lg font-medium ${isPositive ? 'text-buy-600' : 'text-sell-600'}`}>
              {isPositive ? <TrendingUp size={18} className="mr-1" /> : <TrendingDown size={18} className="mr-1" />}
              {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">Market Cap</div>
            <div className="font-semibold text-panel-900">{company.marketCap}</div>
          </div>
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">P/E</div>
            <div className="font-semibold text-panel-900">{keyRatios[0].value}</div>
          </div>
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">P/B</div>
            <div className="font-semibold text-panel-900">{keyRatios[1].value}</div>
          </div>
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">52W High</div>
            <div className="font-semibold text-panel-900">₹{stock.high}</div>
          </div>
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">52W Low</div>
            <div className="font-semibold text-panel-900">₹{stock.low}</div>
          </div>
          <div className="text-center p-3 bg-panel-50 rounded-lg">
            <div className="text-xs text-panel-500 mb-1">Volume</div>
            <div className="font-semibold text-panel-900">{(stock.volume / 1000000).toFixed(2)}M</div>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Ratios */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-primary-600" />
            <h3 className="font-semibold text-panel-900">Key Ratios</h3>
          </div>
          <div className="space-y-3">
            {keyRatios.map((ratio, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-panel-100 last:border-0">
                <span className="text-sm text-panel-600">{ratio.label}</span>
                <span className="font-medium text-panel-900">{ratio.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price History Chart */}
        <div className="lg:col-span-2 card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-primary-600" />
              <h3 className="font-semibold text-panel-900">Price History (1Y)</h3>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-panel-100 text-panel-600 rounded">1M</button>
              <button className="px-3 py-1 text-xs bg-primary-100 text-primary-600 rounded">1Y</button>
              <button className="px-3 py-1 text-xs bg-panel-100 text-panel-600 rounded">ALL</button>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceHistory}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Price']}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={isPositive ? '#22c55e' : '#ef4444'} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Financials Table */}
      <div className="card">
        <div className="flex items-center gap-2 p-4 border-b border-panel-100">
          <Building2 size={20} className="text-primary-600" />
          <h3 className="font-semibold text-panel-900">Financials (₹ Crores)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-panel-50">
                <th className="table-cell text-left">Metric</th>
                <th className="table-cell text-right">FY21</th>
                <th className="table-cell text-right">FY22</th>
                <th className="table-cell text-right">FY23</th>
                <th className="table-cell text-right">FY24</th>
                <th className="table-cell text-right">TTM</th>
              </tr>
            </thead>
            <tbody>
              {financials.map((row, index) => (
                <tr key={index} className="border-b border-panel-100 last:border-0">
                  <td className="table-cell font-medium">{row.metric}</td>
                  <td className="table-cell text-right text-panel-600">{row.fy21}</td>
                  <td className="table-cell text-right text-panel-600">{row.fy22}</td>
                  <td className="table-cell text-right text-panel-600">{row.fy23}</td>
                  <td className="table-cell text-right text-panel-600">{row.fy24}</td>
                  <td className="table-cell text-right text-panel-600">{row.ttm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/trading', { state: { symbol: stockSymbol } })}
          className="flex-1 bg-buy-600 hover:bg-buy-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Buy Stock
        </button>
        <button className="flex-1 bg-sell-600 hover:bg-sell-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2">
          <Minus size={20} />
          Sell Stock
        </button>
      </div>
    </div>
  );
}
