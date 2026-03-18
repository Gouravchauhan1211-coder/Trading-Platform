import { usePortfolioStore } from '../store';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Briefcase, TrendingUp, TrendingDown, Percent } from 'lucide-react';

export default function Portfolio() {
  const { holdings, summary } = usePortfolioStore();
  
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];
  
  const allocationData = holdings.map(h => ({
    name: h.symbol,
    value: h.allocation,
    pnl: h.pnl,
  }));
  
  const pnlData = holdings.map(h => ({
    name: h.symbol,
    pnl: h.pnl,
  }));
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-panel-900">Portfolio</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Briefcase className="text-primary-600" size={20} />
            </div>
            <span className="text-panel-600 text-sm">Total Value</span>
          </div>
          <div className="text-2xl font-bold text-panel-900">
            ₹{summary.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${summary.totalPnL >= 0 ? 'bg-buy-100' : 'bg-sell-100'} rounded-lg`}>
              {summary.totalPnL >= 0 ? (
                <TrendingUp className="text-buy-600" size={20} />
              ) : (
                <TrendingDown className="text-sell-600" size={20} />
              )}
            </div>
            <span className="text-panel-600 text-sm">Total P&L</span>
          </div>
          <div className={`text-2xl font-bold ${
            summary.totalPnL >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.totalPnL >= 0 ? '+' : ''}₹{summary.totalPnL.toFixed(2)}
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${summary.totalPnLPercent >= 0 ? 'bg-buy-100' : 'bg-sell-100'} rounded-lg`}>
              <Percent className={summary.totalPnLPercent >= 0 ? 'text-buy-600' : 'text-sell-600'} size={20} />
            </div>
            <span className="text-panel-600 text-sm">Return %</span>
          </div>
          <div className={`text-2xl font-bold ${
            summary.totalPnLPercent >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.totalPnLPercent >= 0 ? '+' : ''}{summary.totalPnLPercent.toFixed(2)}%
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 ${summary.dayPnL >= 0 ? 'bg-buy-100' : 'bg-sell-100'} rounded-lg`}>
              {summary.dayPnL >= 0 ? (
                <TrendingUp className="text-buy-600" size={20} />
              ) : (
                <TrendingDown className="text-sell-600" size={20} />
              )}
            </div>
            <span className="text-panel-600 text-sm">Day P&L</span>
          </div>
          <div className={`text-2xl font-bold ${
            summary.dayPnL >= 0 ? 'text-buy-600' : 'text-sell-600'
          }`}>
            {summary.dayPnL >= 0 ? '+' : ''}₹{summary.dayPnL.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Holdings Table */}
      <div className="card">
        <div className="p-4 border-b border-panel-200">
          <h3 className="font-semibold text-panel-900">Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="table-cell">Symbol</th>
                <th className="table-cell">Name</th>
                <th className="table-cell text-right">Qty</th>
                <th className="table-cell text-right">Avg Price</th>
                <th className="table-cell text-right">LTP</th>
                <th className="table-cell text-right">Current Value</th>
                <th className="table-cell text-right">P&L</th>
                <th className="table-cell text-right">P&L %</th>
                <th className="table-cell text-right">Allocation</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((holding) => (
                <tr key={holding.symbol} className="hover:bg-panel-50">
                  <td className="table-cell font-medium">{holding.symbol}</td>
                  <td className="table-cell text-panel-600">{holding.name}</td>
                  <td className="table-cell text-right">{holding.quantity}</td>
                  <td className="table-cell text-right">₹{holding.averagePrice.toFixed(2)}</td>
                  <td className="table-cell text-right">₹{holding.ltp.toFixed(2)}</td>
                  <td className="table-cell text-right font-medium">
                    ₹{holding.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td className={`table-cell text-right font-medium ${
                    holding.pnl >= 0 ? 'text-buy-600' : 'text-sell-600'
                  }`}>
                    {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)}
                  </td>
                  <td className={`table-cell text-right font-medium ${
                    holding.pnlPercent >= 0 ? 'text-buy-600' : 'text-sell-600'
                  }`}>
                    {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 bg-panel-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                      <span className="text-sm text-panel-600">{holding.allocation}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold text-panel-900 mb-4">Allocation</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={allocationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {allocationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card p-6">
          <h3 className="font-semibold text-panel-900 mb-4">P&L by Stock</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pnlData}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, 'P&L']} />
              <Bar dataKey="pnl">
                {pnlData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}