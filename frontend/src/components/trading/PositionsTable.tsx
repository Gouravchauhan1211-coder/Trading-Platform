import { useOrderStore } from '../../store';

export default function PositionsTable() {
  const { positions } = useOrderStore();
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Symbol</th>
            <th className="table-cell text-right">Qty</th>
            <th className="table-cell text-right">Avg Price</th>
            <th className="table-cell text-right">LTP</th>
            <th className="table-cell text-right">PnL</th>
            <th className="table-cell text-right">PnL %</th>
            <th className="table-cell">Side</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => (
            <tr key={position.id} className="hover:bg-panel-50">
              <td className="table-cell font-medium">{position.symbol}</td>
              <td className="table-cell text-right">{position.quantity}</td>
              <td className="table-cell text-right">₹{position.averagePrice.toFixed(2)}</td>
              <td className="table-cell text-right">₹{position.currentPrice.toFixed(2)}</td>
              <td className={`table-cell text-right font-medium ${
                position.pnl >= 0 ? 'text-buy-600' : 'text-sell-600'
              }`}>
                {position.pnl >= 0 ? '+' : ''}₹{position.pnl.toFixed(2)}
              </td>
              <td className={`table-cell text-right font-medium ${
                position.pnlPercent >= 0 ? 'text-buy-600' : 'text-sell-600'
              }`}>
                {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
              </td>
              <td className="table-cell">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  position.side === 'LONG' 
                    ? 'bg-buy-100 text-buy-700' 
                    : 'bg-sell-100 text-sell-700'
                }`}>
                  {position.side}
                </span>
              </td>
            </tr>
          ))}
          {positions.length === 0 && (
            <tr>
              <td colSpan={7} className="table-cell text-center text-panel-500 py-8">
                No open positions
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}