import { useOrderStore } from '../../store';
import { X } from 'lucide-react';

export default function OrdersTable() {
  const { orders, removeOrder } = useOrderStore();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-alert-100 text-alert-700';
      case 'EXECUTED': return 'bg-buy-100 text-buy-700';
      case 'CANCELLED': return 'bg-panel-200 text-panel-600';
      case 'REJECTED': return 'bg-sell-100 text-sell-700';
      default: return 'bg-panel-100 text-panel-600';
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Symbol</th>
            <th className="table-cell">Side</th>
            <th className="table-cell">Type</th>
            <th className="table-cell text-right">Qty</th>
            <th className="table-cell text-right">Price</th>
            <th className="table-cell">Status</th>
            <th className="table-cell">Time</th>
            <th className="table-cell">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-panel-50">
              <td className="table-cell font-medium">{order.symbol}</td>
              <td className={`table-cell font-medium ${
                order.side === 'BUY' ? 'text-buy-600' : 'text-sell-600'
              }`}>
                {order.side}
              </td>
              <td className="table-cell">{order.type}</td>
              <td className="table-cell text-right">{order.quantity}</td>
              <td className="table-cell text-right">
                {order.price ? `₹${order.price.toFixed(2)}` : 'Market'}
              </td>
              <td className="table-cell">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="table-cell text-sm text-panel-500">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              <td className="table-cell">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => removeOrder(order.id)}
                    className="p-1 hover:bg-sell-100 rounded"
                  >
                    <X size={16} className="text-sell-600" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={8} className="table-cell text-center text-panel-500 py-8">
                No orders
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}