package com.trading.marketdata.controller;

import com.trading.marketdata.entity.CommodityData;
import com.trading.marketdata.service.CommodityService;
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
@RequestMapping("/api/commodities")
@RequiredArgsConstructor
public class CommodityController {

    private final CommodityService commodityService;

    @GetMapping
    @CircuitBreaker(name = "commodityService", fallbackMethod = "getAllCommoditiesFallback")
    @RateLimiter(name = "commodityService")
    public ResponseEntity<List<CommodityData>> getAllCommodities() {
        log.info("Received request to fetch all commodities");
        List<CommodityData> commodities = commodityService.getAllCommodities();
        log.info("Returning {} commodities", commodities.size());
        return ResponseEntity.ok(commodities);
    }
    
    public ResponseEntity<List<CommodityData>> getAllCommoditiesFallback(Exception ex) {
        log.warn("Circuit breaker activated for getAllCommodities. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }
}

