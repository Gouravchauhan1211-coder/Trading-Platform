import { useState } from 'react';
import { Newspaper, TrendingUp, Filter, Clock, ExternalLink } from 'lucide-react';

interface NewsItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  time: string;
  source: string;
  image?: string;
}

interface TrendingStock {
  symbol: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function News() {
  const [filterCategory, setFilterCategory] = useState('');
  
  // Sample news data
  const newsItems: NewsItem[] = [
    {
      id: '1',
      tag: 'Markets',
      tagColor: '#5b8af7',
      title: 'NIFTY 50 hits record intraday high amid strong FII inflows and robust earnings season',
      time: '2 hours ago',
      source: 'Economic Times'
    },
    {
      id: '2',
      tag: 'Economy',
      tagColor: '#00d084',
      title: "India's GDP growth projected at 7.2% for FY25, beats analyst expectations",
      time: '4 hours ago',
      source: 'Business Standard'
    },
    {
      id: '3',
      tag: 'Company',
      tagColor: '#f5a623',
      title: 'Reliance Industries Q3 results: Net profit up 18% YoY to ₹21,930 crore',
      time: '5 hours ago',
      source: 'Mint'
    },
    {
      id: '4',
      tag: 'Global',
      tagColor: '#a855f7',
      title: 'US Fed signals rate cuts in 2025 — emerging markets including India set to benefit',
      time: '6 hours ago',
      source: 'Reuters'
    },
    {
      id: '5',
      tag: 'Company',
      tagColor: '#f5a623',
      title: 'TCS bags $1.5 billion multi-year deal with European financial services giant',
      time: '8 hours ago',
      source: 'CNBC TV18'
    },
    {
      id: '6',
      tag: 'Markets',
      tagColor: '#5b8af7',
      title: 'SEBI proposes tighter norms for F&O trading to protect retail investors',
      time: '10 hours ago',
      source: 'LiveMint'
    },
    {
      id: '7',
      tag: 'Economy',
      tagColor: '#00d084',
      title: 'RBI holds repo rate steady at 6.5% — fourth consecutive pause as inflation cools',
      time: '1 day ago',
      source: 'Bloomberg'
    },
    {
      id: '8',
      tag: 'Company',
      tagColor: '#a855f7',
      title: 'Sun Pharma gets USFDA nod for key oncology drug, stock surges 3%',
      time: '1 day ago',
      source: 'Moneycontrol'
    },
  ];

  // Trending stocks in news
  const trendingStocks: TrendingStock[] = [
    { symbol: 'RELIANCE', mentions: 45, sentiment: 'positive' },
    { symbol: 'TCS', mentions: 38, sentiment: 'positive' },
    { symbol: 'HDFCBANK', mentions: 32, sentiment: 'neutral' },
    { symbol: 'INFY', mentions: 28, sentiment: 'positive' },
    { symbol: 'SUNPHARMA', mentions: 25, sentiment: 'positive' },
    { symbol: 'TATAMOTORS', mentions: 22, sentiment: 'negative' },
  ];

  const categories = ['', 'Markets', 'Economy', 'Company', 'Global'];

  const filteredNews = filterCategory 
    ? newsItems.filter(item => item.tag === filterCategory)
    : newsItems;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-panel-900">Market News</h1>
        <span className="text-sm text-panel-500">Latest financial news from India & global markets</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main News Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="card p-4">
            <div className="flex items-center gap-4">
              <Filter size={18} className="text-panel-500" />
              <span className="font-medium text-panel-900">Filter by:</span>
              <select 
                className="input w-auto"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === '' ? 'All News' : cat}
                  </option>
                ))}
              </select>
              <span className="ml-auto text-sm text-panel-500">
                {filteredNews.length} articles
              </span>
            </div>
          </div>

          {/* News List */}
          <div className="card">
            {filteredNews.map((item, index) => (
              <div 
                key={item.id}
                className={`p-4 border-b border-panel-100 last:border-0 hover:bg-panel-50 cursor-pointer transition-colors ${
                  index === 0 ? 'bg-panel-50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {item.image && (
                    <div 
                      className="w-20 h-16 rounded-lg bg-panel-200 flex-shrink-0"
                      style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span 
                        className="px-2 py-0.5 rounded text-xs font-semibold uppercase"
                        style={{ backgroundColor: `${item.tagColor}20`, color: item.tagColor }}
                      >
                        {item.tag}
                      </span>
                      <span className="text-xs text-panel-500 flex items-center gap-1">
                        <Clock size={12} />
                        {item.time}
                      </span>
                    </div>
                    <h3 className="font-medium text-panel-900 mb-1 line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-panel-500">
                      <span>{item.source}</span>
                      <ExternalLink size={12} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Stocks in News */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary-600" />
              <h3 className="font-semibold text-panel-900">Trending Stocks in News</h3>
            </div>
            <div className="space-y-3">
              {trendingStocks.map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-panel-500 w-4">{index + 1}</span>
                    <span className="font-medium text-panel-900">{stock.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-panel-500">{stock.mentions}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      stock.sentiment === 'positive' ? 'bg-buy-600' :
                      stock.sentiment === 'negative' ? 'bg-sell-600' :
                      'bg-panel-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Sentiment */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper size={20} className="text-primary-600" />
              <h3 className="font-semibold text-panel-900">Market Sentiment</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-panel-600">Bullish</span>
                  <span className="text-buy-600 font-medium">58%</span>
                </div>
                <div className="h-2 bg-panel-100 rounded-full overflow-hidden">
                  <div className="h-full bg-buy-600 rounded-full" style={{ width: '58%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-panel-600">Neutral</span>
                  <span className="text-panel-500 font-medium">24%</span>
                </div>
                <div className="h-2 bg-panel-100 rounded-full overflow-hidden">
                  <div className="h-full bg-panel-400 rounded-full" style={{ width: '24%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-panel-600">Bearish</span>
                  <span className="text-sell-600 font-medium">18%</span>
                </div>
                <div className="h-2 bg-panel-100 rounded-full overflow-hidden">
                  <div className="h-full bg-sell-600 rounded-full" style={{ width: '18%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="card p-4">
            <h3 className="font-semibold text-panel-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                <ExternalLink size={14} />
                Economic Times
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                <ExternalLink size={14} />
                Moneycontrol
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                <ExternalLink size={14} />
                LiveMint
              </a>
              <a href="#" className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700">
                <ExternalLink size={14} />
                Bloomberg
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
