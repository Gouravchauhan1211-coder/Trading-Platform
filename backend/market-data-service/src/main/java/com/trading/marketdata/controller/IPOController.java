package com.trading.marketdata.controller;

import com.trading.marketdata.entity.IPODetails;
import com.trading.marketdata.service.IPOService;
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
@RequestMapping("/api/ipo")
@RequiredArgsConstructor
public class IPOController {

    private final IPOService ipoService;

    @GetMapping
    @CircuitBreaker(name = "ipoService", fallbackMethod = "getAllIPOsFallback")
    @RateLimiter(name = "ipoService")
    public ResponseEntity<List<IPODetails>> getAllIPOs(
            @RequestParam(required = false, defaultValue = "all") String type) {
        
        log.info("Received request to fetch IPOs - type: {}", type);
        
        List<IPODetails> ipos;
        
        switch (type.toLowerCase()) {
            case "open":
                ipos = ipoService.getOpenIPOs();
                break;
            case "upcoming":
                ipos = ipoService.getUpcomingIPOs();
                break;
            default:
                ipos = ipoService.getAllIPOs();
        }
        
        log.info("Returning {} IPOs", ipos.size());
        return ResponseEntity.ok(ipos);
    }
    
    public ResponseEntity<List<IPODetails>> getAllIPOsFallback(String type, Exception ex) {
        log.warn("Circuit breaker activated for getAllIPOs. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }
}

