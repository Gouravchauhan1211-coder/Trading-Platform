import React, { useState, useEffect, useCallback, useRef } from 'react';
import { marketApi } from '../../services/api';
import { NSESymbol } from '../../types';

interface StockSearchProps {
  onSelectStock?: (symbol: NSESymbol) => void;
  placeholder?: string;
  className?: string;
}

const StockSearch: React.FC<StockSearchProps> = ({ 
  onSelectStock, 
  placeholder = 'Search stocks (e.g., RELIANCE, TCS)...',
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NSESymbol[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const stocks = await marketApi.searchStocks(searchQuery);
      setResults(stocks);
      setIsOpen(stocks.length > 0);
    } catch (err) {
      console.error('Error searching stocks:', err);
      setError('Failed to search stocks');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchStocks(value);
    }, 300);
  };

  // Handle stock selection
  const handleSelectStock = (stock: NSESymbol) => {
    setQuery(stock.symbol);
    setIsOpen(false);
    if (onSelectStock) {
      onSelectStock(stock);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load initial stocks suggestions
  const loadSuggestions = useCallback(async () => {
    if (query.length >= 1) {
      try {
        const suggestions = await marketApi.getStockSuggestions(query, 10);
        if (query.length > 0) {
          setResults(suggestions);
          setIsOpen(suggestions.length > 0);
        }
      } catch (err) {
        console.error('Error loading suggestions:', err);
      }
    }
  }, [query]);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true);
            } else if (query.length > 0) {
              searchStocks(query);
            }
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-600 rounded-lg bg-gray-800 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          autoComplete="off"
        />
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {error ? (
            <div className="px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((stock, index) => (
                <li key={stock.id || stock.symbol || index}>
                  <button
                    onClick={() => handleSelectStock(stock)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 focus:outline-none focus:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-400">
                            {stock.symbol}
                          </span>
                          {stock.series && stock.series !== 'EQ' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-600 text-yellow-100">
                              {stock.series}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate mt-0.5">
                          {stock.companyName}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="text-xs text-gray-500">
                          {stock.stockExchange}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length > 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              No stocks found for "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Search hint */}
      {!isOpen && !query && (
        <p className="mt-1.5 text-xs text-gray-500">
          Type to search NSE stocks by symbol or company name
        </p>
      )}
    </div>
  );
};

export default StockSearch;
