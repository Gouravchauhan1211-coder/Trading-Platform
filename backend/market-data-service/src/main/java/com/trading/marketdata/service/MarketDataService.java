package com.trading.marketdata.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.common.events.MarketPriceEvent;
import com.trading.marketdata.entity.MarketData;
import com.trading.marketdata.entity.NSESymbol;
import com.trading.marketdata.repository.MarketDataRepository;
import com.trading.marketdata.repository.NSESymbolRepository;
import com.trading.marketdata.service.NSEScraperService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketDataService {

    private final MarketDataRepository marketDataRepository;
    private final NSESymbolRepository nseSymbolRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final NSEScraperService nseScraperService;

    private static final String MARKET_DATA_CACHE_PREFIX = "market:data:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(5);

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "saveMarketDataFallback")
    @Retry(name = "marketDataService")
    public void saveMarketData(MarketPriceEvent event) {
        log.info("Saving market data for symbol: {} on exchange: {}", event.getSymbol(), event.getExchange());
        long startTime = System.currentTimeMillis();
        
        try {
            // Try to find existing record and update, or create new one
            Optional<MarketData> existing = marketDataRepository.findBySymbolAndExchange(
                event.getSymbol(), event.getExchange());
            
            MarketData marketData;
            if (existing.isPresent()) {
                marketData = existing.get();
                log.debug("Updating existing market data record for {}:{}", event.getExchange(), event.getSymbol());
                marketData.setLastPrice(event.getLastPrice());
                marketData.setOpenPrice(event.getOpenPrice());
                marketData.setHighPrice(event.getHighPrice());
                marketData.setLowPrice(event.getLowPrice());
                marketData.setClosePrice(event.getClosePrice());
                marketData.setVolume(event.getVolume());
                marketData.setBidPrice(event.getBidPrice());
                marketData.setAskPrice(event.getAskPrice());
                marketData.setBidQuantity(event.getBidQuantity());
                marketData.setAskQuantity(event.getAskQuantity());
                marketData.setTimestamp(event.getTimestamp());
            } else {
                log.debug("Creating new market data record for {}:{}", event.getExchange(), event.getSymbol());
                marketData = MarketData.builder()
                    .symbol(event.getSymbol())
                    .exchange(event.getExchange())
                    .lastPrice(event.getLastPrice())
                    .openPrice(event.getOpenPrice())
                    .highPrice(event.getHighPrice())
                    .lowPrice(event.getLowPrice())
                    .closePrice(event.getClosePrice())
                    .volume(event.getVolume())
                    .bidPrice(event.getBidPrice())
                    .askPrice(event.getAskPrice())
                    .bidQuantity(event.getBidQuantity())
                    .askQuantity(event.getAskQuantity())
                    .timestamp(event.getTimestamp())
                    .build();
            }

            marketDataRepository.save(marketData);
            cacheMarketData(event);
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Successfully saved market data for {}:{} in {}ms - Price: {}, Volume: {}", 
                event.getExchange(), event.getSymbol(), duration, event.getLastPrice(), event.getVolume());
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to save market data for {}:{} after {}ms: {}", 
                event.getExchange(), event.getSymbol(), duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public void saveMarketDataFallback(MarketPriceEvent event, Exception ex) {
        log.warn("Circuit breaker activated for saveMarketData({}, {}), skipping save. Error: {}", 
            event.getExchange(), event.getSymbol(), ex.getMessage());
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "cacheMarketDataFallback")
    @Retry(name = "marketDataService")
    public void cacheMarketData(MarketPriceEvent event) {
        log.debug("Caching market data for symbol: {} on exchange: {}", event.getSymbol(), event.getExchange());
        long startTime = System.currentTimeMillis();
        
        try {
            // Cache full market data
            String key = MARKET_DATA_CACHE_PREFIX + event.getSymbol() + ":" + event.getExchange();
            String value = objectMapper.writeValueAsString(event);
            redisTemplate.opsForValue().set(key, value, CACHE_TTL);
            
            // Cache simple price for order service (price:RELIANCE format)
            String priceKey = "price:" + event.getSymbol();
            if (event.getLastPrice() != null) {
                redisTemplate.opsForValue().set(priceKey, event.getLastPrice().toString(), CACHE_TTL);
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Successfully cached market data for {}:{} in {}ms", 
                event.getExchange(), event.getSymbol(), duration);
        } catch (JsonProcessingException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to serialize market data for {}:{} after {}ms: {}", 
                event.getExchange(), event.getSymbol(), duration, e.getMessage(), e);
            throw new RuntimeException("Failed to serialize market data", e);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to cache market data for {}:{} after {}ms: {}", 
                event.getExchange(), event.getSymbol(), duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public void cacheMarketDataFallback(MarketPriceEvent event, Exception ex) {
        log.warn("Circuit breaker activated for cacheMarketData({}, {}), skipping cache. Error: {}", 
            event.getExchange(), event.getSymbol(), ex.getMessage());
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getCachedMarketDataFallback")
    @RateLimiter(name = "marketDataService")
    public Optional<MarketPriceEvent> getCachedMarketData(String symbol, String exchange) {
        log.debug("Retrieving cached market data for symbol: {} on exchange: {}", symbol, exchange);
        long startTime = System.currentTimeMillis();
        
        try {
            String key = MARKET_DATA_CACHE_PREFIX + symbol + ":" + exchange;
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                MarketPriceEvent event = objectMapper.readValue(value, MarketPriceEvent.class);
                long duration = System.currentTimeMillis() - startTime;
                log.debug("Successfully retrieved cached market data for {}:{} in {}ms - Price: {}", 
                    exchange, symbol, duration, event.getLastPrice());
                return Optional.of(event);
            } else {
                long duration = System.currentTimeMillis() - startTime;
                log.debug("No cached market data found for {}:{} after {}ms", exchange, symbol, duration);
                return Optional.empty();
            }
        } catch (JsonProcessingException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to deserialize market data for {}:{} after {}ms: {}", 
                exchange, symbol, duration, e.getMessage(), e);
            throw new RuntimeException("Failed to deserialize market data", e);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve cached market data for {}:{} after {}ms: {}", 
                exchange, symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public Optional<MarketPriceEvent> getCachedMarketDataFallback(String symbol, String exchange, Exception ex) {
        log.warn("Circuit breaker activated for getCachedMarketData({}, {}), returning empty. Error: {}", 
            symbol, exchange, ex.getMessage());
        return Optional.empty();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getNSEStockDataFallback")
    @RateLimiter(name = "marketDataService")
    public Optional<MarketPriceEvent> getNSEStockData(String symbol) throws Exception {
        log.debug("Retrieving NSE stock data for symbol: {}", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            Optional<MarketPriceEvent> result = nseScraperService.getCachedStockData(symbol);
            long duration = System.currentTimeMillis() - startTime;
            
            if (result.isPresent()) {
                log.debug("Successfully retrieved NSE stock data for {} in {}ms - Price: {}", 
                    symbol, duration, result.get().getLastPrice());
            } else {
                log.debug("No NSE stock data found for {} after {}ms", symbol, duration);
            }
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve NSE stock data for {} after {}ms: {}", 
                symbol, duration, e.getMessage(), e);
            return Optional.empty();
        }
    }
    
    public Optional<MarketPriceEvent> getNSEStockDataFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getNSEStockData({}), returning empty. Error: {}", 
            symbol, ex.getMessage());
        return Optional.empty();
    }
    
    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getCachedPriceFallback")
    @RateLimiter(name = "marketDataService")
    public Optional<BigDecimal> getCachedPrice(String symbol) {
        log.debug("Retrieving cached price for symbol: {}", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            String priceKey = "price:" + symbol;
            String value = redisTemplate.opsForValue().get(priceKey);
            if (value != null) {
                BigDecimal price = new BigDecimal(value);
                long duration = System.currentTimeMillis() - startTime;
                log.debug("Successfully retrieved cached price for {} in {}ms - Price: {}", 
                    symbol, duration, price);
                return Optional.of(price);
            } else {
                long duration = System.currentTimeMillis() - startTime;
                log.debug("No cached price found for {} after {}ms", symbol, duration);
                return Optional.empty();
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve cached price for {} after {}ms: {}", 
                symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public Optional<BigDecimal> getCachedPriceFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getCachedPrice({}), returning empty. Error: {}", 
            symbol, ex.getMessage());
        return Optional.empty();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getLatestMarketDataFallback")
    @RateLimiter(name = "marketDataService")
    public Optional<MarketData> getLatestMarketData(String symbol, String exchange) {
        log.debug("Retrieving latest market data for symbol: {} on exchange: {}", symbol, exchange);
        long startTime = System.currentTimeMillis();
        
        try {
            Optional<MarketData> result = marketDataRepository.findBySymbolAndExchange(symbol, exchange);
            long duration = System.currentTimeMillis() - startTime;
            
            if (result.isPresent()) {
                log.debug("Successfully retrieved latest market data for {}:{} in {}ms - Price: {}", 
                    exchange, symbol, duration, result.get().getLastPrice());
            } else {
                log.debug("No latest market data found for {}:{} after {}ms", exchange, symbol, duration);
            }
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve latest market data for {}:{} after {}ms: {}", 
                exchange, symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public Optional<MarketData> getLatestMarketDataFallback(String symbol, String exchange, Exception ex) {
        log.warn("Circuit breaker activated for getLatestMarketData({}, {}), returning empty. Error: {}", 
            symbol, exchange, ex.getMessage());
        return Optional.empty();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllMarketDataFallback")
    @RateLimiter(name = "marketDataService")
    public List<MarketData> getAllMarketData() {
        log.info("Retrieving all market data records");
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> marketData = marketDataRepository.findAll();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully retrieved {} market data records in {}ms", marketData.size(), duration);
            return marketData;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve all market data after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<MarketData> getAllMarketDataFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllMarketData, returning empty list. Error: {}", ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllSymbolsFallback")
    @RateLimiter(name = "marketDataService")
    public List<String> getAllSymbols() {
        log.info("Retrieving all available symbols");
        long startTime = System.currentTimeMillis();
        
        try {
            List<String> symbols = marketDataRepository.findAllSymbols();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully retrieved {} symbols in {}ms", symbols.size(), duration);
            return symbols;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve all symbols after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<String> getAllSymbolsFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllSymbols, returning empty list. Error: {}", ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMarketDataForSymbolsFallback")
    @RateLimiter(name = "marketDataService")
    public List<MarketData> getMarketDataForSymbols(List<String> symbols) {
        log.info("Retrieving market data for {} symbols: {}", symbols.size(), symbols);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> marketData = marketDataRepository.findBySymbolIn(symbols);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully retrieved market data for {} symbols in {}ms", marketData.size(), duration);
            return marketData;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve market data for symbols after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<MarketData> getMarketDataForSymbolsFallback(List<String> symbols, Exception ex) {
        log.warn("Circuit breaker activated for getMarketDataForSymbols, returning empty list. Symbols: {}. Error: {}", 
            symbols, ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMostActiveStocksFallback")
    @RateLimiter(name = "marketDataService")
    public List<MarketData> getMostActiveStocks(String sortBy, int limit) {
        log.info("Retrieving most active stocks sorted by '{}' with limit {}", sortBy, limit);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> allData = marketDataRepository.findAll();
            // Sort by volume or value (turnover) and limit
            List<MarketData> mostActive = allData.stream()
                    .sorted((a, b) -> {
                        if ("value".equals(sortBy)) {
                            // Sort by turnover (lastPrice * volume)
                            BigDecimal aValue = a.getLastPrice() != null && a.getVolume() != null
                                    ? a.getLastPrice().multiply(BigDecimal.valueOf(a.getVolume()))
                                    : BigDecimal.ZERO;
                            BigDecimal bValue = b.getLastPrice() != null && b.getVolume() != null
                                    ? b.getLastPrice().multiply(BigDecimal.valueOf(b.getVolume()))
                                    : BigDecimal.ZERO;
                            return bValue.compareTo(aValue);
                        }
                        // Default: sort by volume
                        Long aVol = a.getVolume() != null ? a.getVolume() : 0L;
                        Long bVol = b.getVolume() != null ? b.getVolume() : 0L;
                        return bVol.compareTo(aVol);
                    })
                    .limit(limit)
                    .toList();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Successfully retrieved {} most active stocks sorted by {} in {}ms", 
                mostActive.size(), sortBy, duration);
            return mostActive;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve most active stocks after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<MarketData> getMostActiveStocksFallback(String sortBy, int limit, Exception ex) {
        log.warn("Circuit breaker activated for getMostActiveStocks({}, {}), returning empty list. Error: {}", 
            sortBy, limit, ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getMarketMoversFallback")
    @RateLimiter(name = "marketDataService")
    public List<MarketData> getMarketMovers(String type, int limit) {
        log.info("Retrieving market {} with limit {}", type, limit);
        long startTime = System.currentTimeMillis();
        
        try {
            List<MarketData> allData = marketDataRepository.findAll();
            // Calculate change percent and sort
            List<MarketData> movers = allData.stream()
                    .filter(d -> d.getLastPrice() != null && d.getClosePrice() != null && d.getClosePrice().compareTo(BigDecimal.ZERO) > 0)
                    .map(d -> {
                        // Calculate change percent
                        BigDecimal change = d.getLastPrice().subtract(d.getClosePrice());
                        BigDecimal changePercent = change.multiply(BigDecimal.valueOf(100))
                                .divide(d.getClosePrice(), 2, java.math.RoundingMode.HALF_UP);
                        return java.util.Map.entry(d, changePercent);
                    })
                    .sorted((a, b) -> {
                        if ("gainers".equals(type)) {
                            return b.getValue().compareTo(a.getValue()); // Descending for gainers
                        }
                        return a.getValue().compareTo(b.getValue()); // Ascending for losers
                    })
                    .limit(limit)
                    .map(java.util.Map.Entry::getKey)
                    .toList();
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Successfully retrieved {} market {} in {}ms", movers.size(), type, duration);
            return movers;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve market {} after {}ms: {}", type, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<MarketData> getMarketMoversFallback(String type, int limit, Exception ex) {
        log.warn("Circuit breaker activated for getMarketMovers({}, {}), returning empty list. Error: {}", 
            type, limit, ex.getMessage());
        return Collections.emptyList();
    }

    // Stock Search Methods

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "searchStocksFallback")
    @RateLimiter(name = "marketDataService")
    public List<NSESymbol> searchStocks(String query) {
        log.info("Searching stocks with query: '{}'", query);
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> results;
            if (query == null || query.trim().isEmpty()) {
                log.debug("Empty query provided, returning all NSE symbols");
                results = getAllNSESymbols();
            } else {
                results = nseSymbolRepository.searchBySymbolOrName(query.trim());
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Stock search for '{}' returned {} results in {}ms", query, results.size(), duration);
            return results;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Stock search for '{}' failed after {}ms: {}", query, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<NSESymbol> searchStocksFallback(String query, Exception ex) {
        log.warn("Circuit breaker activated for searchStocks({}), returning empty list. Error: {}", 
            query, ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getAllNSESymbolsFallback")
    @RateLimiter(name = "marketDataService")
    public List<NSESymbol> getAllNSESymbols() {
        log.info("Retrieving all NSE symbols");
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> symbols = nseSymbolRepository.findAllByOrderBySymbolAsc();
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Successfully retrieved {} NSE symbols in {}ms", symbols.size(), duration);
            return symbols;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve NSE symbols after {}ms: {}", duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<NSESymbol> getAllNSESymbolsFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllNSESymbols, returning empty list. Error: {}", ex.getMessage());
        return Collections.emptyList();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getNSESymbolBySymbolFallback")
    @RateLimiter(name = "marketDataService")
    public Optional<NSESymbol> getNSESymbolBySymbol(String symbol) {
        log.debug("Retrieving NSE symbol for symbol: '{}'", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            Optional<NSESymbol> result = nseSymbolRepository.findBySymbol(symbol.toUpperCase());
            long duration = System.currentTimeMillis() - startTime;
            
            if (result.isPresent()) {
                log.debug("Successfully retrieved NSE symbol for {} ({}) in {}ms", 
                    symbol, result.get().getCompanyName(), duration);
            } else {
                log.debug("NSE symbol not found for '{}' after {}ms", symbol, duration);
            }
            
            return result;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve NSE symbol for '{}' after {}ms: {}", 
                symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public Optional<NSESymbol> getNSESymbolBySymbolFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getNSESymbolBySymbol({}), returning empty. Error: {}", 
            symbol, ex.getMessage());
        return Optional.empty();
    }

    @CircuitBreaker(name = "marketDataService", fallbackMethod = "getStockSuggestionsFallback")
    @RateLimiter(name = "marketDataService")
    public List<NSESymbol> getStockSuggestions(String prefix, int limit) {
        log.info("Retrieving stock suggestions for prefix: '{}' with limit: {}", prefix, limit);
        long startTime = System.currentTimeMillis();
        
        try {
            List<NSESymbol> symbols = nseSymbolRepository.findBySymbolStartingWithIgnoreCase(prefix.toUpperCase());
            List<NSESymbol> suggestions = symbols.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("Successfully retrieved {} stock suggestions for prefix '{}' in {}ms", 
                suggestions.size(), prefix, duration);
            return suggestions;
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to retrieve stock suggestions for prefix '{}' after {}ms: {}", 
                prefix, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public List<NSESymbol> getStockSuggestionsFallback(String prefix, int limit, Exception ex) {
        log.warn("Circuit breaker activated for getStockSuggestions({}, {}), returning empty list. Error: {}", 
            prefix, limit, ex.getMessage());
        return Collections.emptyList();
    }
}

