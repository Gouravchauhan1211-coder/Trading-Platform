import { useState } from 'react';
import { useMarketStore, useOrderStore } from '../../store';
import { orderApi } from '../../services/api';
import type { OrderType, OrderSide, ProductType } from '../../types';

interface OrderPanelProps {
  symbol: string | null;
}

export default function OrderPanel({ symbol }: OrderPanelProps) {
  const { stocks } = useMarketStore();
  const { addOrder, addTrade } = useOrderStore();
  
  const [orderSide, setOrderSide] = useState<OrderSide>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [productType, setProductType] = useState<ProductType>('CNC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentStock = symbol ? stocks[symbol] : null;
  const ltp = currentStock?.ltp || 0;
  const orderPrice = orderType === 'MARKET' ? ltp : parseFloat(price || '0');
  const totalValue = orderPrice * quantity;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quantity) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const orderResponse = await orderApi.createOrder({
        symbol,
        side: orderSide,
        type: orderType === 'MARKET' ? 'MARKET' : 'LIMIT',
        quantity,
        price: orderType !== 'MARKET' ? parseFloat(price) : undefined,
        exchange: 'NSE',
      });
      
      // Add to local store for display
      const order = {
        id: orderResponse.orderId,
        symbol,
        side: orderSide,
        type: orderType,
        quantity,
        price: orderPrice,
        status: orderResponse.status === 'FILLED' ? 'EXECUTED' as const : 'PENDING' as const,
        createdAt: orderResponse.createdAt || new Date().toISOString(),
        productType,
      };
      
      addOrder(order);
      
      // Add trade if filled
      if (orderResponse.status === 'FILLED') {
        addTrade({
          id: orderResponse.orderId,
          orderId: orderResponse.orderId,
          symbol,
          side: orderSide,
          quantity,
          price: orderPrice,
          timestamp: new Date().toISOString(),
        });
      }
      
      // Reset form
      setQuantity(1);
      setPrice('');
      setStopLoss('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-panel-0 rounded-lg p-4 border border-panel-200">
      <h3 className="text-lg font-semibold text-panel-900 mb-4">Place Order</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-sell-100 text-sell-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Side */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOrderSide('BUY')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              orderSide === 'BUY'
                ? 'bg-buy-500 text-white'
                : 'bg-panel-100 text-panel-600 hover:bg-panel-200'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => setOrderSide('SELL')}
            className={`py-2 px-4 rounded-lg font-medium transition-colors ${
              orderSide === 'SELL'
                ? 'bg-sell-500 text-white'
                : 'bg-panel-100 text-panel-600 hover:bg-panel-200'
            }`}
          >
            SELL
          </button>
        </div>
        
        {/* Symbol Display */}
        <div className="bg-panel-50 rounded-lg p-3 text-center">
          <span className="text-lg font-bold text-panel-900">{symbol || 'Select Symbol'}</span>
          <div className="text-2xl font-bold text-panel-900 mt-1">₹{ltp.toFixed(2)}</div>
        </div>
        
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-panel-700 mb-1">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
            className="input"
          >
            <option value="MARKET">MARKET</option>
            <option value="LIMIT">LIMIT</option>
            <option value="SL">STOP LOSS</option>
            <option value="SLM">STOP LOSS MARKET</option>
          </select>
        </div>
        
        {/* Price (for Limit Orders) */}
        {orderType !== 'MARKET' && (
          <div>
            <label className="block text-sm font-medium text-panel-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              className="input"
              step="0.05"
            />
          </div>
        )}
        
        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-panel-700 mb-1">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
            min="1"
            className="input"
          />
        </div>
        
        {/* Product Type */}
        <div>
          <label className="block text-sm font-medium text-panel-700 mb-1">Product</label>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value as ProductType)}
            className="input"
          >
            <option value="CNC">CNC</option>
            <option value="MIS">MIS</option>
            <option value="NRML">NRML</option>
          </select>
        </div>
        
        {/* Order Summary */}
        <div className="bg-panel-50 rounded-lg p-3 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-panel-600">Order Value</span>
            <span className="text-panel-900 font-medium">₹{totalValue.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={!symbol || isSubmitting}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            orderSide === 'BUY'
              ? 'bg-buy-500 hover:bg-buy-600 text-white'
              : 'bg-sell-500 hover:bg-sell-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSubmitting ? 'Processing...' : `${orderSide} ${symbol || ''}`}
        </button>
      </form>
    </div>
  );
}
