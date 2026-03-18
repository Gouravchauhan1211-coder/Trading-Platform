package com.trading.backtest.controller;

import com.trading.backtest.model.BacktestResult;
import com.trading.backtest.service.BacktestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/backtest")
@RequiredArgsConstructor
public class BacktestController {

    private final BacktestService backtestService;

    @PostMapping("/run")
    public ResponseEntity<BacktestResult> runBacktest(@RequestBody Map<String, Object> request) {
        String symbol = (String) request.get("symbol");
        String strategyType = (String) request.get("strategyType");
        Instant startDate = Instant.parse((String) request.get("startDate"));
        Instant endDate = Instant.parse((String) request.get("endDate"));
        BigDecimal quantity = new BigDecimal(request.get("quantity").toString());
        BigDecimal stopLoss = request.containsKey("stopLoss") ?
                new BigDecimal(request.get("stopLoss").toString()) : null;
        BigDecimal takeProfit = request.containsKey("takeProfit") ?
                new BigDecimal(request.get("takeProfit").toString()) : null;

        BacktestResult result = backtestService.runBacktest(
                symbol, strategyType, startDate, endDate, quantity, stopLoss, takeProfit);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/results/{id}")
    public ResponseEntity<BacktestResult> getBacktestResult(@PathVariable String id) {
        // Return stored result
        return ResponseEntity.ok(BacktestResult.builder().id(java.util.UUID.fromString(id)).build());
    }
}

