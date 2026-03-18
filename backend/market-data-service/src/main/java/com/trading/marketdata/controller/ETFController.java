package com.trading.marketdata.controller;

import com.trading.marketdata.entity.ETFData;
import com.trading.marketdata.service.ETFService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/etf")
@RequiredArgsConstructor
public class ETFController {

    private final ETFService etfService;

    @GetMapping
    @CircuitBreaker(name = "etfService", fallbackMethod = "getAllETFsFallback")
    @RateLimiter(name = "etfService")
    public ResponseEntity<List<ETFData>> getAllETFs() {
        log.info("Received request to fetch all ETFs");
        List<ETFData> etfs = etfService.getAllETFs();
        log.info("Returning {} ETFs", etfs.size());
        return ResponseEntity.ok(etfs);
    }
    
    public ResponseEntity<List<ETFData>> getAllETFsFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllETFs. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/{symbol}")
    @CircuitBreaker(name = "etfService", fallbackMethod = "getETFFallback")
    public ResponseEntity<ETFData> getETF(@PathVariable String symbol) {
        log.info("Received request to fetch ETF: {}", symbol);
        ETFData etf = etfService.getETFBySymbol(symbol);
        
        if (etf != null) {
            return ResponseEntity.ok(etf);
        }
        
        return ResponseEntity.notFound().build();
    }
    
    public ResponseEntity<ETFData> getETFFallback(String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getETF({}). Error: {}", symbol, ex.getMessage());
        return ResponseEntity.notFound().build();
    }
}

