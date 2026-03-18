package com.trading.marketdata.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.common.events.MarketPriceEvent;
import com.trading.marketdata.entity.MarketData;
import com.trading.marketdata.entity.NSESymbol;
import com.trading.marketdata.repository.MarketDataRepository;
import com.trading.marketdata.repository.NSESymbolRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class NSEScraperService {

    private final NSESymbolRepository nseSymbolRepository;
    private final MarketDataRepository marketDataRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String NSE_EQ_URL = "https://www.nseindia.com/api/equity-stock";
    private static final String NSE_ALL_SYMBOLS_URL = "https://www.nseindia.com/api/equity-stock?index=sec_eq";
    private static final String NSE_PREDEFINED_SYMBOLS_URL = "https://www.nseindia.com/api/equity-symbol?exchg=NSE";
    private static final String NSE_QUOTE_URL = "https://www.nseindia.com/api/quote-equity?symbol=";
    
    @Value("${app.nse.scrape.enabled:true}")
    private boolean scrapeEnabled;
    
    private static final Duration STOCK_DATA_TTL = Duration.ofDays(7);
    private static final String STOCK_DATA_PREFIX = "nse:stock:";

    /**
     * Fetch all equity symbols from NSE India
     * This uses the NSE India API endpoint
     */
    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "fetchAllNSESymbolsFallback")
    @Retry(name = "nseScraperService")
    @RateLimiter(name = "nseScraperService")
    @TimeLimiter(name = "nseScraperService")
    public CompletableFuture<List<NSESymbol>> fetchAllNSESymbols() {
        log.info("Starting NSE stock symbols fetch from NSE India...");
        long startTime = System.currentTimeMillis();
        List<NSESymbol> symbols = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Accept", "application/json");
            headers.set("Accept-Language", "en-US,en;q=0.9");
            headers.set("Referer", "https://www.nseindia.com/");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            try {
                log.debug("Attempting primary NSE endpoint: {}", NSE_ALL_SYMBOLS_URL);
                ResponseEntity<String> response = restTemplate.exchange(
                    NSE_ALL_SYMBOLS_URL,
                    HttpMethod.GET,
                    entity,
                    String.class
                );
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    symbols = parseNSEResponse(response.getBody()).get();
                    log.info("Successfully fetched {} symbols from primary NSE endpoint", symbols.size());
                }
            } catch (Exception e) {
                log.warn("Primary NSE endpoint failed, trying fallback: {}", e.getMessage());
                
                try {
                    log.debug("Attempting fallback NSE endpoint: {}", NSE_PREDEFINED_SYMBOLS_URL);
                    ResponseEntity<String> fallbackResponse = restTemplate.exchange(
                        NSE_PREDEFINED_SYMBOLS_URL,
                        HttpMethod.GET,
                        entity,
                        String.class
                    );
                    
                    if (fallbackResponse.getStatusCode() == HttpStatus.OK && fallbackResponse.getBody() != null) {
                        symbols = parsePredefinedSymbols(fallbackResponse.getBody()).get();
                        log.info("Successfully fetched {} symbols from fallback endpoint", symbols.size());
                    }
                } catch (Exception ex) {
                    log.warn("Fallback endpoint also failed: {}", ex.getMessage());
                }
            }
            
            if (symbols.isEmpty()) {
                log.info("Loading predefined NSE stock symbols as final fallback");
                symbols = getPredefinedNSESymbols();
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.info("NSE symbols fetch completed in {}ms - Total symbols: {}", duration, symbols.size());
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error fetching NSE symbols after {}ms: {}", duration, e.getMessage(), e);
            symbols = getPredefinedNSESymbols();
        }
        
        return CompletableFuture.completedFuture(symbols);
    }
    
    public CompletableFuture<List<NSESymbol>> fetchAllNSESymbolsFallback(Exception ex) {
        log.warn("Circuit breaker activated for fetchAllNSESymbols, returning predefined symbols. Error: {}", ex.getMessage());
        return CompletableFuture.completedFuture(getPredefinedNSESymbols());
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "parseNSEResponseFallback")
    @Retry(name = "nseScraperService")
    public CompletableFuture<List<NSESymbol>> parseNSEResponse(String jsonResponse) {
        log.debug("Parsing NSE API response with length: {} chars", jsonResponse.length());
        long startTime = System.currentTimeMillis();
        List<NSESymbol> symbols = new ArrayList<>();
        
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode dataNode = rootNode.has("data") ? rootNode.get("data") : rootNode;
            
            if (dataNode != null && dataNode.isArray()) {
                for (JsonNode node : dataNode) {
                    try {
                        NSESymbol symbol = NSESymbol.builder()
                            .symbol(getTextValue(node, "symbol"))
                            .companyName(getTextValue(node, "companyName"))
                            .series(getTextValue(node, "series"))
                            .listingDate(getTextValue(node, "listingDate"))
                            .paidUpValue(getBigDecimalValue(node, "paidUpValue"))
                            .marketLot(getIntValue(node, "marketLot"))
                            .isinCode(getTextValue(node, "isinCode"))
                            .faceValue(getBigDecimalValue(node, "faceValue"))
                            .industry(getTextValue(node, "industry"))
                            .sector(getTextValue(node, "sector"))
                            .marketCap(getBigDecimalValue(node, "marketCap"))
                            .tickSize(getBigDecimalValue(node, "tickSize"))
                            .upperCircuit(getBigDecimalValue(node, "upperCircuit"))
                            .lowerCircuit(getBigDecimalValue(node, "lowerCircuit"))
                            .priceBand(getTextValue(node, "priceBand"))
                            .active(getBooleanValue(node, "active"))
                            .stockExchange("NSE")
                            .lastUpdated(Instant.now())
                            .build();
                        
                        if (symbol.getSymbol() != null && !symbol.getSymbol().isEmpty()) {
                            symbols.add(symbol);
                        }
                    } catch (Exception e) {
                        log.debug("Error parsing symbol: {}", e.getMessage());
                    }
                }
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Successfully parsed {} NSE symbols from response in {}ms", symbols.size(), duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error parsing NSE response after {}ms: {}", duration, e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(symbols);
    }
    
    public CompletableFuture<List<NSESymbol>> parseNSEResponseFallback(String jsonResponse, Exception ex) {
        log.warn("Circuit breaker activated for parseNSEResponse, returning empty list. Error: {}", ex.getMessage());
        return CompletableFuture.completedFuture(new ArrayList<>());
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "parsePredefinedSymbolsFallback")
    @Retry(name = "nseScraperService")
    public CompletableFuture<List<NSESymbol>> parsePredefinedSymbols(String jsonResponse) {
        log.debug("Parsing predefined symbols response with length: {} chars", jsonResponse.length());
        long startTime = System.currentTimeMillis();
        List<NSESymbol> symbols = new ArrayList<>();
        
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            
            if (rootNode.isArray()) {
                for (JsonNode node : rootNode) {
                    try {
                        NSESymbol symbol = NSESymbol.builder()
                            .symbol(getTextValue(node, "symbol"))
                            .companyName(getTextValue(node, "name"))
                            .series(getTextValue(node, "series"))
                            .isinCode(getTextValue(node, "isin"))
                            .industry(getTextValue(node, "industry"))
                            .sector(getTextValue(node, "sector"))
                            .active(true)
                            .stockExchange("NSE")
                            .lastUpdated(Instant.now())
                            .build();
                        
                        if (symbol.getSymbol() != null && !symbol.getSymbol().isEmpty()) {
                            symbols.add(symbol);
                        }
                    } catch (Exception e) {
                        log.debug("Error parsing predefined symbol: {}", e.getMessage());
                    }
                }
            }
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Successfully parsed {} predefined symbols in {}ms", symbols.size(), duration);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error parsing predefined symbols response after {}ms: {}", duration, e.getMessage(), e);
        }
        
        return CompletableFuture.completedFuture(symbols);
    }
    
    public CompletableFuture<List<NSESymbol>> parsePredefinedSymbolsFallback(String jsonResponse, Exception ex) {
        log.warn("Circuit breaker activated for parsePredefinedSymbols, returning empty list. Error: {}", ex.getMessage());
        return CompletableFuture.completedFuture(new ArrayList<>());
    }

    /**
     * Get predefined list of common NSE stocks as fallback
     */
    private List<NSESymbol> getPredefinedNSESymbols() {
        List<NSESymbol> symbols = new ArrayList<>();
        
        String[] predefinedStocks = {
            "RELIANCE,Reliance Industries Ltd",
            "TCS,Tata Consultancy Services Ltd",
            "HDFCBANK,HDFC Bank Ltd",
            "INFY,Infosys Ltd",
            "ICICIBANK,ICICI Bank Ltd",
            "SBIN,State Bank of India",
            "BAJFINANCE,Bajaj Finance Ltd",
            "HINDUNILVR,Hindustan Unilever Ltd",
            "BHARTIARTL,Bharti Airtel Ltd",
            "KOTAKBANK,Kotak Mahindra Bank Ltd",
            "TITAN,Titan Company Ltd",
            "ASIANPAINT,Asian Paints Ltd",
            "MARUTI,Maruti Suzuki India Ltd",
            "SUNPHARMA,Sun Pharmaceutical Industries Ltd",
            "TATAMOTORS,Tata Motors Ltd",
            "WIPRO,Wipro Ltd",
            "AXISBANK,Axis Bank Ltd",
            "LT,Larsen & Toubro Ltd",
            "ADANIPORTS,Adani Ports and SEZ Ltd",
            "SHRIRAMFIN,Shriram Finance Ltd",
            "DLF,DLF Ltd",
            "GRASIM,Grasim Industries Ltd",
            "ADANIENT,Adani Enterprises Ltd",
            "POWERGRID,Power Grid Corporation of India Ltd",
            "NTPC,NTPC Ltd",
            "M&M,Mahindra & Mahindra Ltd",
            "JSWSTEEL,JSW Steel Ltd",
            "TATASTEEL,Tata Steel Ltd",
            "HCLTECH,HCL Technologies Ltd",
            "TECHM,Mindtree Ltd",
            "INFRATEL,Bharti Infratel Ltd",
            "ULTRACEMCO,UltraTech Cement Ltd",
            "CIPLA,Cipla Ltd",
            "DRREDDY,Dr. Reddy's Laboratories Ltd",
            "NESTLEIND,Nestle India Ltd",
            "BAJAJFINSV,Bajaj Finserv Ltd",
            "INDUSINDBK,IndusInd Bank Ltd",
            "ONGC,Oil and Natural Gas Corporation Ltd",
            "IOC,Indian Oil Corporation Ltd",
            "HEROHERO,Hero MotoCorp Ltd",
            "EICHERMOT,Eicher Motors Ltd",
            "BPCL,Bharat Petroleum Corporation Ltd",
            "COALINDIA,Coal India Ltd",
            "VEDL,Vedanta Ltd",
            "GAIL,GAIL India Ltd",
            "SHREECEM,Shree Cement Ltd",
            "AMBUJACEM,Ambuja Cements Ltd",
            "HAVELLS,Havells India Ltd",
            "IDEA,Vodafone Idea Ltd"
        };
        
        for (String stock : predefinedStocks) {
            String[] parts = stock.split(",");
            NSESymbol symbol = NSESymbol.builder()
                .symbol(parts[0])
                .companyName(parts[1])
                .series("EQ")
                .stockExchange("NSE")
                .faceValue(BigDecimal.valueOf(1))
                .marketLot(1)
                .active(true)
                .lastUpdated(Instant.now())
                .build();
            symbols.add(symbol);
        }
        
        return symbols;
    }

    /**
     * Fetch stock prices for all symbols with anti-blocking measures
     */
    private void fetchAllStockPrices(List<NSESymbol> symbols) {
        log.info("Fetching stock prices for {} symbols", symbols.size());
        int successCount = 0;
        int errorCount = 0;
        
        for (NSESymbol symbol : symbols) {
            try {
                // Add random delay between requests to avoid blocking
                if (successCount > 0) {
                    Thread.sleep(ThreadLocalRandom.current().nextInt(100, 300));
                }
                
                MarketPriceEvent priceEvent = fetchStockPrice(symbol.getSymbol()).get();
                if (priceEvent != null) {
                    cacheStockData(priceEvent);
                    successCount++;
                    
                    // Log progress every 50 symbols
                    if (successCount % 50 == 0) {
                        log.info("Successfully fetched prices for {} symbols", successCount);
                    }
                }
            } catch (Exception e) {
                errorCount++;
                log.debug("Error fetching price for {}: {}", symbol.getSymbol(), e.getMessage());
                
                // If we get too many errors, take a longer break
                if (errorCount % 10 == 0) {
                    try {
                        Thread.sleep(ThreadLocalRandom.current().nextInt(1000, 3000));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                }
            }
        }
        
        log.info("Stock price fetch completed. Success: {}, Errors: {}", successCount, errorCount);
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "fetchStockPriceFallback")
    @Retry(name = "nseScraperService")
    @RateLimiter(name = "nseScraperService")
    @TimeLimiter(name = "nseScraperService")
    public CompletableFuture<MarketPriceEvent> fetchStockPrice(String symbol) {
        log.debug("Fetching stock price for symbol: {}", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            HttpHeaders headers = createNSEHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = NSE_QUOTE_URL + symbol;
            log.debug("Making request to NSE quote API: {}", url);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String responseBody = response.getBody();
                
                // Check if response contains garbled characters
                if (containsGarbledCharacters(responseBody)) {
                    log.warn("Response contains garbled characters for symbol: {}. Response length: {}", 
                        symbol, responseBody.length());
                    return CompletableFuture.completedFuture(null);
                }
                
                MarketPriceEvent event = parseStockPriceResponse(responseBody, symbol).get();
                if (event != null) {
                    long duration = System.currentTimeMillis() - startTime;
                    log.debug("Successfully fetched stock price for {} in {}ms - Price: {}", 
                        symbol, duration, event.getLastPrice());
                    return CompletableFuture.completedFuture(event);
                }
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Error fetching stock price for {} after {}ms: {}", symbol, duration, e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    public CompletableFuture<MarketPriceEvent> fetchStockPriceFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for fetchStockPrice({}), returning null. Error: {}", 
            symbol, ex.getMessage());
        return CompletableFuture.completedFuture(null);
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "parseStockPriceResponseFallback")
    @Retry(name = "nseScraperService")
    public CompletableFuture<MarketPriceEvent> parseStockPriceResponse(String jsonResponse, String symbol) {
        log.debug("Parsing stock price response for symbol: {}", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode priceInfo = rootNode.path("priceInfo");
            JsonNode metaData = rootNode.path("metadata");
            
            if (!priceInfo.isMissingNode() && !metaData.isMissingNode()) {
                MarketPriceEvent event = MarketPriceEvent.builder()
                    .symbol(symbol)
                    .exchange("NSE")
                    .lastPrice(getBigDecimalValue(priceInfo, "lastPrice"))
                    .openPrice(getBigDecimalValue(priceInfo, "open"))
                    .highPrice(getBigDecimalValue(priceInfo, "high"))
                    .lowPrice(getBigDecimalValue(priceInfo, "low"))
                    .closePrice(getBigDecimalValue(priceInfo, "previousClose"))
                    .volume(getLongValue(priceInfo, "volume"))
                    .bidPrice(getBigDecimalValue(priceInfo.path("buyInfo").path(0), "price"))
                    .askPrice(getBigDecimalValue(priceInfo.path("sellInfo").path(0), "price"))
                    .bidQuantity(getBigDecimalValue(priceInfo.path("buyInfo").path(0), "quantity"))
                    .askQuantity(getBigDecimalValue(priceInfo.path("sellInfo").path(0), "quantity"))
                    .timestamp(Instant.now())
                    .dataSource("NSE_API")
                    .build();
                
                long duration = System.currentTimeMillis() - startTime;
                log.debug("Successfully parsed stock price for {} in {}ms - Price: {}", 
                    symbol, duration, event.getLastPrice());
                return CompletableFuture.completedFuture(event);
            }
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Error parsing stock price response for {} after {}ms: {}", symbol, duration, e.getMessage());
        }
        
        return CompletableFuture.completedFuture(null);
    }
    
    public CompletableFuture<MarketPriceEvent> parseStockPriceResponseFallback(String jsonResponse, String symbol, Exception ex) {
        log.warn("Circuit breaker activated for parseStockPriceResponse({}, {}), returning null. Error: {}", 
            symbol, jsonResponse.length(), ex.getMessage());
        return CompletableFuture.completedFuture(null);
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "cacheStockDataFallback")
    @Retry(name = "nseScraperService")
    public void cacheStockData(MarketPriceEvent event) throws Exception {
        log.debug("Caching stock data for symbol: {}", event.getSymbol());
        long startTime = System.currentTimeMillis();
        
        try {
            // Cache in Redis (existing functionality)
            String redisKey = STOCK_DATA_PREFIX + event.getSymbol();
            String redisValue = objectMapper.writeValueAsString(event);
            redisTemplate.opsForValue().set(redisKey, redisValue, STOCK_DATA_TTL);
            
            // Save to database
            saveMarketDataToDatabase(event);
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Successfully cached stock data for {} in {}ms (Redis + DB)", event.getSymbol(), duration);
        } catch (JsonProcessingException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to serialize stock data for {} after {}ms: {}", event.getSymbol(), duration, e.getMessage(), e);
            throw new RuntimeException("Failed to serialize stock data", e);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error caching stock data for {} after {}ms: {}", event.getSymbol(), duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public void cacheStockDataFallback(MarketPriceEvent event, Exception ex) {
        log.warn("Circuit breaker activated for cacheStockData({}), skipping cache. Error: {}", 
            event.getSymbol(), ex.getMessage());
    }

    /**
     * Save market data to database
     */
    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "saveMarketDataToDatabaseFallback")
    @Retry(name = "nseScraperService")
    private void saveMarketDataToDatabase(MarketPriceEvent event) {
        log.debug("Saving market data to database for symbol: {}", event.getSymbol());
        long startTime = System.currentTimeMillis();
        
        try {
            // Check if record exists
            Optional<MarketData> existingData = marketDataRepository.findBySymbolAndExchange(
                event.getSymbol(), event.getExchange());
            
            MarketData marketData;
            if (existingData.isPresent()) {
                // Update existing record
                marketData = existingData.get();
                log.debug("Updating existing market data record for: {}", event.getSymbol());
            } else {
                // Create new record
                marketData = MarketData.builder()
                    .symbol(event.getSymbol())
                    .exchange(event.getExchange())
                    .build();
                log.debug("Creating new market data record for: {}", event.getSymbol());
            }
            
            // Update fields from MarketPriceEvent
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
            
            // Calculate change amount and percentage
            if (event.getClosePrice() != null && event.getLastPrice() != null) {
                BigDecimal changeAmount = event.getLastPrice().subtract(event.getClosePrice());
                marketData.setChangeAmount(changeAmount);
                
                if (event.getClosePrice().compareTo(BigDecimal.ZERO) > 0) {
                    BigDecimal changePercentage = changeAmount
                        .divide(event.getClosePrice(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                    marketData.setChangePercentage(changePercentage);
                }
            }
            
            marketDataRepository.save(marketData);
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("Successfully saved market data to database for {} in {}ms", 
                event.getSymbol(), duration);
                
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error saving market data to database for {} after {}ms: {}", 
                event.getSymbol(), duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public void saveMarketDataToDatabaseFallback(MarketPriceEvent event, Exception ex) {
        log.warn("Circuit breaker activated for saveMarketDataToDatabase({}), skipping DB save. Error: {}", 
            event.getSymbol(), ex.getMessage());
    }

    /**
     * Create headers for NSE API requests with anti-blocking measures
     */
    private HttpHeaders createNSEHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("User-Agent", getRandomUserAgent());
        headers.set("Accept", "application/json, text/plain, */*");
        headers.set("Accept-Language", "en-US,en;q=0.9");
        headers.set("Accept-Encoding", "gzip, deflate, br");
        headers.set("Connection", "keep-alive");
        headers.set("Referer", "https://www.nseindia.com/");
        headers.set("Origin", "https://www.nseindia.com");
        headers.set("Sec-Fetch-Dest", "empty");
        headers.set("Sec-Fetch-Mode", "cors");
        headers.set("Sec-Fetch-Site", "same-origin");
        headers.set("Cache-Control", "no-cache");
        headers.set("Pragma", "no-cache");
        return headers;
    }

    /**
     * Get random user agent to avoid detection
     */
    private String getRandomUserAgent() {
        String[] userAgents = {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
        };
        return userAgents[ThreadLocalRandom.current().nextInt(userAgents.length)];
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "getCachedStockDataFallback")
    @RateLimiter(name = "nseScraperService")
    public Optional<MarketPriceEvent> getCachedStockData(String symbol) throws Exception {
        log.debug("Retrieving cached stock data for symbol: {}", symbol);
        long startTime = System.currentTimeMillis();
        
        try {
            String key = STOCK_DATA_PREFIX + symbol;
            String value = redisTemplate.opsForValue().get(key);
            if (value != null) {
                MarketPriceEvent event = objectMapper.readValue(value, MarketPriceEvent.class);
                long duration = System.currentTimeMillis() - startTime;
                log.debug("Successfully retrieved cached stock data for {} in {}ms - Price: {}", 
                    symbol, duration, event.getLastPrice());
                return Optional.of(event);
            } else {
                long duration = System.currentTimeMillis() - startTime;
                log.debug("No cached stock data found for {} after {}ms", symbol, duration);
                return Optional.empty();
            }
        } catch (JsonProcessingException e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Failed to deserialize stock data for {} after {}ms: {}", symbol, duration, e.getMessage(), e);
            throw new RuntimeException("Failed to deserialize stock data", e);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("Error retrieving cached stock data for {} after {}ms: {}", symbol, duration, e.getMessage(), e);
            throw e;
        }
    }
    
    public Optional<MarketPriceEvent> getCachedStockDataFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getCachedStockData({}), returning empty. Error: {}", 
            symbol, ex.getMessage());
        return Optional.empty();
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "syncNSESymbolsFallback")
    @Retry(name = "nseScraperService")
    @Scheduled(fixedRateString = "${app.nse.scrape.poll-interval:180000}") // Run every 3 minutes
    public void syncNSESymbols() {
        if (!scrapeEnabled) {
            log.info("NSE scraping is disabled");
            return;
        }
        
        log.info("Starting scheduled NSE symbols synchronization");
        try {
            List<NSESymbol> symbols = fetchAllNSESymbols().get();
            if (!symbols.isEmpty()) {
                fetchAllStockPrices(symbols);
                log.info("Scheduled NSE sync completed successfully");
            } else {
                log.warn("No NSE symbols available for sync");
            }
        } catch (Exception e) {
            log.error("Error during scheduled NSE sync: {}", e.getMessage(), e);
        }
    }
    
    public void syncNSESymbolsFallback(Exception ex) {
        log.warn("Circuit breaker activated for syncNSESymbols, skipping sync. Error: {}", ex.getMessage());
    }

    @CircuitBreaker(name = "nseScraperService", fallbackMethod = "initialLoadFallback")
    @Retry(name = "nseScraperService")
    public CompletableFuture<Void> initialLoad() {
        if (!scrapeEnabled) {
            log.info("NSE scraping is disabled");
            return CompletableFuture.completedFuture(null);
        }
        
        try {
            log.info("Performing initial NSE symbols load...");
            TimeUnit.SECONDS.sleep(5);
            
            if (nseSymbolRepository.count() == 0) {
                log.info("No NSE symbols found in database, performing initial load");
                syncNSESymbols(); // This is now void
                return CompletableFuture.completedFuture(null);
            } else {
                log.info("NSE symbols already exist in database ({}), skipping initial load", nseSymbolRepository.count());
                return CompletableFuture.completedFuture(null);
            }
        } catch (Exception e) {
            log.error("Error in initial NSE symbols load: {}", e.getMessage(), e);
            return CompletableFuture.completedFuture(null);
        }
    }
    
    public CompletableFuture<Void> initialLoadFallback(Exception ex) {
        log.warn("Circuit breaker activated for initialLoad, skipping initial load. Error: {}", ex.getMessage());
        return CompletableFuture.completedFuture(null);
    }

    // Helper methods
    private String getTextValue(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        return fieldNode != null && !fieldNode.isNull() ? fieldNode.asText() : null;
    }

    private BigDecimal getBigDecimalValue(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        if (fieldNode != null && !fieldNode.isNull()) {
            try {
                return new BigDecimal(fieldNode.asText());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Integer getIntValue(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        if (fieldNode != null && !fieldNode.isNull()) {
            return fieldNode.asInt();
        }
        return null;
    }

    private Long getLongValue(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        if (fieldNode != null && !fieldNode.isNull()) {
            return fieldNode.asLong();
        }
        return null;
    }

    private Boolean getBooleanValue(JsonNode node, String field) {
        JsonNode fieldNode = node.get(field);
        if (fieldNode != null && !fieldNode.isNull()) {
            return fieldNode.asBoolean();
        }
        return null;
    }

    /**
     * Check if response contains garbled characters (compression/encoding issues)
     */
    private boolean containsGarbledCharacters(String response) {
        if (response == null || response.isEmpty()) {
            return true;
        }
        
        // Check for common garbled character patterns
        int garbledCount = 0;
        int totalChars = Math.min(response.length(), 100); // Check first 100 chars
        
        for (int i = 0; i < totalChars; i++) {
            char c = response.charAt(i);
            // Check for characters outside normal ASCII/Unicode ranges that suggest encoding issues
            if ((c >= 0xFFFD && c <= 0xFFFF) || // Replacement character
                (c >= 0x80 && c <= 0x9F) ||     // Control characters
                (c >= 0xF0 && c <= 0xFF)) {     // High byte characters
                garbledCount++;
            }
        }
        
        // If more than 10% of checked characters are garbled, consider the response corrupted
        return (garbledCount * 100 / totalChars) > 10;
    }
}

