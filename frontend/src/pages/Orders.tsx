import { useState } from 'react';
import { useOrderStore } from '../store';
import { X, CheckCircle, Clock, XCircle } from 'lucide-react';

type TabType = 'open' | 'completed' | 'cancelled';

export default function Orders() {
  const { orders, removeOrder } = useOrderStore();
  const [activeTab, setActiveTab] = useState<TabType>('open');
  
  const openOrders = orders.filter(o => o.status === 'PENDING');
  const completedOrders = orders.filter(o => o.status === 'EXECUTED');
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED');
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="text-alert-600" size={16} />;
      case 'EXECUTED':
        return <CheckCircle className="text-buy-600" size={16} />;
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="text-sell-600" size={16} />;
      default:
        return null;
    }
  };
  
  const renderOrders = (orderList: typeof orders) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th className="table-cell">Order ID</th>
            <th className="table-cell">Symbol</th>
            <th className="table-cell">Side</th>
            <th className="table-cell">Type</th>
            <th className="table-cell text-right">Qty</th>
            <th className="table-cell text-right">Price</th>
            <th className="table-cell">Status</th>
            <th className="table-cell">Created</th>
            <th className="table-cell">Action</th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order) => (
            <tr key={order.id} className="hover:bg-panel-50">
              <td className="table-cell font-mono text-sm">{order.id}</td>
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
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className="text-sm">{order.status}</span>
                </div>
              </td>
              <td className="table-cell text-sm text-panel-500">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              <td className="table-cell">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => removeOrder(order.id)}
                    className="p-1 hover:bg-sell-100 rounded"
                    title="Cancel Order"
                  >
                    <X size={16} className="text-sell-600" />
                  </button>
                )}
              </td>
            </tr>
          ))}
          {orderList.length === 0 && (
            <tr>
              <td colSpan={9} className="table-cell text-center text-panel-500 py-8">
                No orders
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-panel-900">Orders</h1>
      
      {/* Tabs */}
      <div className="flex gap-2 border-b border-panel-200">
        <button
          onClick={() => setActiveTab('open')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'open'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Open Orders ({openOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'completed'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Completed ({completedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'cancelled'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-panel-600 hover:text-panel-900'
          }`}
        >
          Cancelled ({cancelledOrders.length})
        </button>
      </div>
      
      {/* Content */}
      <div className="card">
        {activeTab === 'open' && renderOrders(openOrders)}
        {activeTab === 'completed' && renderOrders(completedOrders)}
        {activeTab === 'cancelled' && renderOrders(cancelledOrders)}
      </div>
    </div>
  );
}