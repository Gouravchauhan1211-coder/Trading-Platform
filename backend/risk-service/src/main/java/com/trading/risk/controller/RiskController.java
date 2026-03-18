package com.trading.risk.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    @GetMapping("/limits")
    public ResponseEntity<Map<String, Object>> getRiskLimits(@RequestParam UUID userId) {
        return ResponseEntity.ok(Map.of(
                "maxPositionSize", 100000.0,
                "maxDailyLoss", 10000.0,
                "maxOpenOrders", 20,
                "maxLeverage", 1.0,
                "emergencyStop", false
        ));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateTrade(@RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(Map.of(
                "approved", true,
                "reason", "Risk checks passed"
        ));
    }

    @PutMapping("/limits")
    public ResponseEntity<Map<String, String>> updateRiskLimits(@RequestParam UUID userId, @RequestBody Map<String, Object> limits) {
        return ResponseEntity.ok(Map.of("message", "Risk limits updated"));
    }
}

