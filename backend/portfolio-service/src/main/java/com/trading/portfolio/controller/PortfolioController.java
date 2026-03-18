package com.trading.portfolio.controller;

import com.trading.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPortfolio(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(portfolioService.getPortfolio());
    }

    @GetMapping("/positions")
    public ResponseEntity<List<Map<String, Object>>> getPositions(@RequestParam(required = false) UUID userId) {
        return ResponseEntity.ok(portfolioService.getPositions());
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPortfolioSummary(@RequestParam(required = false) UUID userId) {
        Map<String, Object> portfolio = portfolioService.getPortfolio();
        return ResponseEntity.ok(Map.of(
                "totalValue", portfolio.getOrDefault("totalValue", 0.0),
                "unrealizedPnL", portfolio.getOrDefault("unrealizedPnL", 0.0),
                "positionsCount", ((List<?>)portfolio.get("positions")).size()
        ));
    }
}

