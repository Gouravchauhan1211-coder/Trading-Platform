import { useOrderStore } from '../../store';

export default function TradesTable() {
  const { trades } = useOrderStore();
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Symbol</th>
            <th className="table-cell">Side</th>
            <th className="table-cell text-right">Qty</th>
            <th className="table-cell text-right">Price</th>
            <th className="table-cell text-right">Value</th>
            <th className="table-cell">Time</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-panel-50">
              <td className="table-cell font-medium">{trade.symbol}</td>
              <td className={`table-cell font-medium ${
                trade.side === 'BUY' ? 'text-buy-600' : 'text-sell-600'
              }`}>
                {trade.side}
              </td>
              <td className="table-cell text-right">{trade.quantity}</td>
              <td className="table-cell text-right">₹{trade.price.toFixed(2)}</td>
              <td className="table-cell text-right font-medium">
                ₹{(trade.price * trade.quantity).toFixed(2)}
              </td>
              <td className="table-cell text-sm text-panel-500">
                {new Date(trade.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
          {trades.length === 0 && (
            <tr>
              <td colSpan={6} className="table-cell text-center text-panel-500 py-8">
                No trades
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}