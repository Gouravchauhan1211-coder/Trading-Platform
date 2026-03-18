package com.trading.marketdata.controller;

import com.trading.marketdata.entity.MutualFundData;
import com.trading.marketdata.service.MutualFundService;
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
@RequestMapping("/api/mutual-funds")
@RequiredArgsConstructor
public class MutualFundController {

    private final MutualFundService mutualFundService;

    @GetMapping
    @CircuitBreaker(name = "mutualFundService", fallbackMethod = "getAllFundsFallback")
    @RateLimiter(name = "mutualFundService")
    public ResponseEntity<List<MutualFundData>> getAllFunds(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "10") int limit) {
        
        log.info("Received request to fetch mutual funds - category: {}, search: {}", category, search);
        
        List<MutualFundData> funds;
        
        if (search != null && !search.isEmpty()) {
            funds = mutualFundService.searchFunds(search);
        } else if (category != null && !category.isEmpty()) {
            funds = mutualFundService.getFundsByCategory(category);
        } else {
            funds = mutualFundService.getTopFunds(limit);
        }
        
        log.info("Returning {} mutual funds", funds.size());
        return ResponseEntity.ok(funds);
    }
    
    public ResponseEntity<List<MutualFundData>> getAllFundsFallback(String category, String search, int limit, Exception ex) {
        log.warn("Circuit breaker activated for getAllFunds. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }
}

