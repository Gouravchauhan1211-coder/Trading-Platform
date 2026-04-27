import { useState, useEffect } from 'react';
import { Newspaper, TrendingUp, Filter, Clock, ExternalLink, Brain, Sparkles, Loader2, Info } from 'lucide-react';
import { aiApi, newsApi } from '../services';

interface NewsItem {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  time: string;
  source: string;
  image?: string;
  summary?: string;
}

interface TrendingStock {
  symbol: string;
  mentions: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [trending, setTrending] = useState<TrendingStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [sentiments, setSentiments] = useState<Record<string, any>>({});
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [newsData, trendingData] = await Promise.all([
          newsApi.getNews(),
          newsApi.getTrending()
        ]);
        setNews(newsData);
        setTrending(trendingData);
      } catch (error) {
        console.error('Failed to fetch news data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const analyzeSentiment = async (item: NewsItem) => {
    setAnalyzingId(item.id);
    try {
      const result = await aiApi.analyzeSentiment(item.title, item.summary || item.source);
      setSentiments(prev => ({ ...prev, [item.id]: result }));
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
    } finally {
      setAnalyzingId(null);
    }
  };
  
  const categories = ['', 'Markets', 'Economy', 'Company', 'Global'];

  const filteredNews = filterCategory 
    ? news.filter(item => item.tag === filterCategory)
    : news;

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
          <p className="text-panel-500 animate-pulse">Fetching latest market headlines...</p>
        </div>
      ) : (
        <>
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
                className={`p-4 border-b border-panel-100 last:border-0 hover:bg-panel-50 transition-colors ${
                  index === 0 ? 'bg-primary-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {item.image && (
                    <div 
                      className="w-20 h-20 rounded-lg bg-panel-200 flex-shrink-0"
                      style={{ backgroundImage: `url(${item.image})`, backgroundSize: 'cover' }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${item.tagColor}20`, color: item.tagColor }}
                        >
                          {item.tag}
                        </span>
                        <span className="text-xs text-panel-500 flex items-center gap-1">
                          <Clock size={12} />
                          {item.time}
                        </span>
                      </div>
                      
                      {sentiments[item.id] ? (
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold border ${
                          sentiments[item.id].sentiment === 'BULLISH' 
                            ? 'bg-buy-50 text-buy-600 border-buy-200' 
                            : sentiments[item.id].sentiment === 'BEARISH'
                            ? 'bg-sell-50 text-sell-600 border-sell-200'
                            : 'bg-panel-50 text-panel-600 border-panel-200'
                        }`}>
                          <Sparkles size={12} />
                          {sentiments[item.id].sentiment}
                        </div>
                      ) : (
                        <button 
                          onClick={() => analyzeSentiment(item)}
                          disabled={analyzingId === item.id}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-80"
                        >
                          {analyzingId === item.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Brain size={12} />
                          )}
                          AI Sentiment
                        </button>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-panel-900 mb-1 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                    
                    {sentiments[item.id] && (
                      <p className="text-xs text-panel-600 mb-2 italic border-l-2 border-panel-200 pl-2">
                        "{sentiments[item.id].reason}"
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-[10px] font-medium text-panel-400">
                        <span>{item.source}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1 cursor-pointer hover:text-panel-600">
                          <ExternalLink size={10} />
                          Read More
                        </div>
                      </div>
                      
                      {sentiments[item.id] && (
                        <div className="flex items-center gap-1 text-[10px] text-panel-400">
                          <Info size={10} />
                          AI Confidence: {Math.round(sentiments[item.id].score * 100)}%
                        </div>
                      )}
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
              {trending.map((stock, index) => (
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
              {trending.length === 0 && (
                <p className="text-xs text-panel-400 text-center py-4">No trending data available</p>
              )}
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
    </>
  )}
</div>
);
}
