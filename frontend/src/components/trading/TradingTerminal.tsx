import { useState, useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { useLocation } from 'react-router-dom';
import { useMarketStore, useOrderStore } from '../../store';
import { marketWebSocket } from '../../services/websocket';
import WatchlistPanel from './WatchlistPanel';
import OrderPanel from './OrderPanel';
import PositionsTable from './PositionsTable';
import OrdersTable from './OrdersTable';
import TradesTable from './TradesTable';
import SignalsTable from './SignalsTable';

type TabType = 'positions' | 'orders' | 'trades' | 'signals';

export default function TradingTerminal() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  
  const { stocks, selectedSymbol, setSelectedSymbol } = useMarketStore();
  const { selectedOrderTab, setSelectedOrderTab } = useOrderStore();
  const location = useLocation();
  
  // Handle symbol from navigation state
  useEffect(() => {
    if (location.state?.symbol) {
      setSelectedSymbol(location.state.symbol);
    }
  }, [location.state?.symbol, setSelectedSymbol]);
  
  const [timeframe, setTimeframe] = useState('1D');
  
  // Connect to WebSocket on mount
  useEffect(() => {
    marketWebSocket.connect();
    
    return () => {
      marketWebSocket.disconnect();
    };
  }, []);
  
  // Generate sample candlestick data
  const generateCandlestickData = (): CandlestickData[] => {
    const data: CandlestickData[] = [];
    let basePrice = selectedSymbol && stocks[selectedSymbol] ? stocks[selectedSymbol].ltp : 2800;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 100; i > 0; i--) {
      const time = (now - i * 3600) as Time;
      const volatility = basePrice * 0.02;
      const open = basePrice + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      data.push({ time, open, high, low, close });
      basePrice = close;
    }
    return data;
  };
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#ffffff' },
        textColor: '#334155',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e2e8f0',
      },
      timeScale: {
        borderColor: '#e2e8f0',
        timeVisible: true,
      },
    });
    
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    
    chartRef.current = chart;
    seriesRef.current = candlestickSeries;
    
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);
  
  // Update chart data when symbol changes
  useEffect(() => {
    if (seriesRef.current) {
      const data = generateCandlestickData();
      seriesRef.current.setData(data);
    }
  }, [selectedSymbol]);
  
  const currentStock = selectedSymbol ? stocks[selectedSymbol] : null;
  
  return (
    <div className="flex flex-col h-full">
      {/* Top Section: Watchlist | Chart | Order Panel */}
      <div className="flex flex-1 min-h-0 gap-4 p-4">
        {/* Watchlist Panel */}
        <div className="w-64 flex-shrink-0">
          <WatchlistPanel 
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>
        
        {/* Chart Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Symbol Info & Timeframe */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              {currentStock && (
                <>
                  <div>
                    <h2 className="text-xl font-bold text-panel-900">{currentStock.symbol}</h2>
                    <p className="text-sm text-panel-500">{currentStock.name}</p>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-panel-900">₹{currentStock.ltp.toFixed(2)}</span>
                    <span className={`ml-2 text-sm font-medium ${
                      currentStock.change >= 0 ? 'text-buy-600' : 'text-sell-600'
                    }`}>
                      {currentStock.change >= 0 ? '+' : ''}{currentStock.change.toFixed(2)} 
                      ({currentStock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-1">
              {['1H', '1D', '1W', '1M'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-sm rounded ${
                    timeframe === tf 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-panel-100 text-panel-600 hover:bg-panel-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Container */}
          <div ref={chartContainerRef} className="flex-1 bg-white rounded-lg border border-panel-200" />
        </div>
        
        {/* Order Panel */}
        <div className="w-72 flex-shrink-0">
          <OrderPanel symbol={selectedSymbol} />
        </div>
      </div>
      
      {/* Bottom Section: Positions | Orders | Trades | Signals */}
      <div className="flex flex-col border-t border-panel-200">
        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-2">
          {(['positions', 'orders', 'trades', 'signals'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedOrderTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                selectedOrderTab === tab
                  ? 'bg-white text-primary-600 border-t border-x border-panel-200'
                  : 'text-panel-500 hover:text-panel-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-4 bg-white">
          {selectedOrderTab === 'positions' && <PositionsTable />}
          {selectedOrderTab === 'orders' && <OrdersTable />}
          {selectedOrderTab === 'trades' && <TradesTable />}
          {selectedOrderTab === 'signals' && <SignalsTable />}
        </div>
      </div>
    </div>
  );
}