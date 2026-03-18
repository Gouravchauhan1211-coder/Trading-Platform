package com.trading.marketdata.controller;

import com.trading.marketdata.entity.MarketData;
import com.trading.marketdata.entity.NSESymbol;
import com.trading.marketdata.service.MarketDataService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@RestController
@RequestMapping("/api/market-data")
@RequiredArgsConstructor
public class MarketDataController {

    private final MarketDataService marketDataService;

    @GetMapping
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllMarketDataFallback")
    @RateLimiter(name = "marketDataService")
    public ResponseEntity<List<MarketData>> getAllMarketData() {
        log.info("Received request to fetch all market data");
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> marketData = marketDataService.getAllMarketData();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} market data records in {}ms", marketData.size(), duration);
            return ResponseEntity.ok(marketData);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch market data after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<MarketData>> getAllMarketDataFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllMarketData, returning empty response. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{symbol}")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMarketDataFallback")
    @Retry(name = "marketDataService")
    @TimeLimiter(name = "marketDataService")
    public CompletableFuture<ResponseEntity<MarketData>> getMarketData(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "NSE") String exchange) {
        
        log.info("Received request to fetch market data for symbol '{}' on exchange '{}'", symbol, exchange);
        long startTime = System.currentTimeMillis();
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                return marketDataService.getLatestMarketData(symbol, exchange)
                    .map(data -> {
                        long duration = System.currentTimeMillis() - startTime;
                        log.info("Successfully fetched market data for {}:{} in {}ms - Price: {}", 
                            exchange, symbol, duration, data.getLastPrice());
                        return ResponseEntity.ok(data);
                    })
                    .orElseGet(() -> {
                        long duration = System.currentTimeMillis() - startTime;
                        log.warn("No market data found for {}:{} after {}ms", exchange, symbol, duration);
                        return ResponseEntity.notFound().build();
                    });
            } catch (Exception e) {
                long duration = System.currentTimeMillis() - startTime;
                log.error("Failed to fetch market data for {}:{} after {}ms: {}", 
                    exchange, symbol, duration, e.getMessage(), e);
                throw new RuntimeException(e);
            }
        });
    }
    
    public CompletableFuture<ResponseEntity<MarketData>> getMarketDataFallback(String symbol, String exchange, Exception ex) {
        log.warn("Circuit breaker activated for getMarketData({}, {}), returning 404. Error: {}", 
            symbol, exchange, ex.getMessage());
        return CompletableFuture.completedFuture(ResponseEntity.notFound().build());
    }

    @GetMapping("/quotes")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getQuotesFallback")
    @RateLimiter(name = "marketDataService")
    public ResponseEntity<List<MarketData>> getQuotes(@RequestParam List<String> symbols) {
        log.info("Received request to fetch quotes for {} symbols: {}", symbols.size(), symbols);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> quotes = marketDataService.getAllMarketData();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched quotes for {} symbols in {}ms", quotes.size(), duration);
            return ResponseEntity.ok(quotes);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch quotes after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<MarketData>> getQuotesFallback(List<String> symbols, Exception ex) {
        log.warn("Circuit breaker activated for getQuotes, returning empty response. Symbols: {}. Error: {}", 
            symbols, ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/symbols")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllSymbolsFallback")
    public ResponseEntity<List<String>> getAllSymbols() {
        log.info("Received request to fetch all available symbols");
        long startTime = System.currentTimeMillis();
        
        try {
            List<String> symbols = marketDataService.getAllSymbols();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} symbols in {}ms", symbols.size(), duration);
            return ResponseEntity.ok(symbols);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch symbols after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<String>> getAllSymbolsFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllSymbols, returning empty response. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/indices")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getIndicesFallback")
    public ResponseEntity<List<MarketData>> getIndices() {
        List<String> indices = List.of("NIFTY", "BANKNIFTY", "NIFTYMIDCAP", "SENSEX");
        log.info("Received request to fetch market indices: {}", indices);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> indexData = marketDataService.getMarketDataForSymbols(indices);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} indices in {}ms", indexData.size(), duration);
            return ResponseEntity.ok(indexData);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch indices after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<MarketData>> getIndicesFallback(Exception ex) {
        log.warn("Circuit breaker activated for getIndices, returning empty response. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/most-active")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMostActiveFallback")
    public ResponseEntity<List<MarketData>> getMostActive(
            @RequestParam(defaultValue = "volume") String sortBy) {
        log.info("Received request to fetch most active stocks sorted by '{}'", sortBy);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> mostActive = marketDataService.getMostActiveStocks(sortBy, 10);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} most active stocks sorted by {} in {}ms", 
                mostActive.size(), sortBy, duration);
            return ResponseEntity.ok(mostActive);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch most active stocks after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<MarketData>> getMostActiveFallback(String sortBy, Exception ex) {
        log.warn("Circuit breaker activated for getMostActive({}), returning empty response. Error: {}", 
            sortBy, ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/movers")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMoversFallback")
    public ResponseEntity<List<MarketData>> getMovers(
            @RequestParam(defaultValue = "gainers") String type) {
        log.info("Received request to fetch market movers of type '{}'", type);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> movers = marketDataService.getMarketMovers(type, 10);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} market {} in {}ms", movers.size(), type, duration);
            return ResponseEntity.ok(movers);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch market {} after {}ms: {}", type, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<MarketData>> getMoversFallback(String type, Exception ex) {
        log.warn("Circuit breaker activated for getMovers({}), returning empty response. Error: {}", 
            type, ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    // Stock Search Endpoints

    @GetMapping("/stocks/search")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "searchStocksFallback")
    @RateLimiter(name = "marketDataService")
    public ResponseEntity<List<NSESymbol>> searchStocks(@RequestParam String query) {
        log.info("Received stock search request with query: '{}'", query);
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> results = marketDataService.searchStocks(query);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Stock search for '{}' returned {} results in {}ms", query, results.size(), duration);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Stock search for '{}' failed after {}ms: {}", query, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<NSESymbol>> searchStocksFallback(String query, Exception ex) {
        log.warn("Circuit breaker activated for searchStocks({}), returning empty response. Error: {}", 
            query, ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/stocks/all")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllStocksFallback")
    public ResponseEntity<List<NSESymbol>> getAllStocks() {
        log.info("Received request to fetch all NSE stocks");
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> stocks = marketDataService.getAllNSESymbols();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} NSE stocks in {}ms", stocks.size(), duration);
            return ResponseEntity.ok(stocks);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch NSE stocks after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<NSESymbol>> getAllStocksFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllStocks, returning empty response. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/stocks/{symbol}")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getStockBySymbolFallback")
    @Retry(name = "marketDataService")
    public ResponseEntity<NSESymbol> getStockBySymbol(@PathVariable String symbol) {
        log.info("Received request to fetch stock details for symbol: '{}'", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            return marketDataService.getNSESymbolBySymbol(symbol)
                .map(stock -> {
                    long duration = System.currentTimeMillis() - startTime;
                    log.info("Successfully fetched stock details for {} ({}) in {}ms", 
                        symbol, stock.getCompanyName(), duration);
                    return ResponseEntity.ok(stock);
                })
                .orElseGet(() -> {
                    long duration = System.currentTimeMillis() - startTime;
                    log.warn("Stock not found for symbol '{}' after {}ms", symbol, duration);
                    return ResponseEntity.notFound().build();
                });
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch stock details for '{}' after {}ms: {}", symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<NSESymbol> getStockBySymbolFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getStockBySymbol({}), returning 404. Error: {}", 
            symbol, ex.getMessage());
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/stocks/suggestions")
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getStockSuggestionsFallback")
    @RateLimiter(name = "marketDataService")
    public ResponseEntity<List<NSESymbol>> getStockSuggestions(
            @RequestParam String prefix,
            @RequestParam(defaultValue = "10") int limit) {
        log.info("Received request for stock suggestions with prefix: '{}' and limit: {}", prefix, limit);
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> suggestions = marketDataService.getStockSuggestions(prefix, limit);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully fetched {} stock suggestions for prefix '{}' in {}ms", 
                suggestions.size(), prefix, duration);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to fetch stock suggestions for prefix '{}' after {}ms: {}", 
                prefix, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public ResponseEntity<List<NSESymbol>> getStockSuggestionsFallback(String prefix, int limit, Exception ex) {
        log.warn("Circuit breaker activated for getStockSuggestions({}, {}), returning empty response. Error: {}", 
            prefix, limit, ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }
}

