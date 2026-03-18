import { useOrderStore } from '../../store';

export default function SignalsTable() {
  const { signals } = useOrderStore();
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Symbol</th>
            <th className="table-cell">Type</th>
            <th className="table-cell">Direction</th>
            <th className="table-cell text-right">Price</th>
            <th className="table-cell">Strategy</th>
            <th className="table-cell">Time</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((signal) => (
            <tr key={signal.id} className="hover:bg-panel-50">
              <td className="table-cell font-medium">{signal.symbol}</td>
              <td className="table-cell">
                <span className={`signal-badge ${signal.type === 'ENTRY' ? 'bg-signal-100 text-signal-700' : 'bg-alert-100 text-alert-700'}`}>
                  {signal.type}
                </span>
              </td>
              <td className="table-cell">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  signal.direction === 'LONG' 
                    ? 'bg-buy-100 text-buy-700' 
                    : 'bg-sell-100 text-sell-700'
                }`}>
                  {signal.direction}
                </span>
              </td>
              <td className="table-cell text-right">₹{signal.price.toFixed(2)}</td>
              <td className="table-cell text-sm text-panel-600">{signal.strategy}</td>
              <td className="table-cell text-sm text-panel-500">
                {new Date(signal.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
          {signals.length === 0 && (
            <tr>
              <td colSpan={6} className="table-cell text-center text-panel-500 py-8">
                No signals
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}