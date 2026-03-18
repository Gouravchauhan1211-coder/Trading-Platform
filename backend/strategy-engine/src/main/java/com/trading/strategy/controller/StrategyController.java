package com.trading.strategy.controller;

import com.trading.strategy.entity.Strategy;
import com.trading.strategy.service.StrategyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/strategies")
@RequiredArgsConstructor
public class StrategyController {

    private final StrategyService strategyService;

    @PostMapping
    public ResponseEntity<Strategy> createStrategy(@RequestBody Strategy strategy) {
        return ResponseEntity.ok(strategyService.createStrategy(strategy));
    }

    @GetMapping
    public ResponseEntity<List<Strategy>> getStrategies(@RequestParam(required = false) UUID userId) {
        if (userId != null) {
            return ResponseEntity.ok(strategyService.getStrategiesByUser(userId));
        }
        return ResponseEntity.ok(strategyService.getActiveStrategies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Strategy> getStrategy(@PathVariable UUID id) {
        return strategyService.getStrategiesByUser(null).stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Strategy> startStrategy(@PathVariable UUID id) {
        return ResponseEntity.ok(strategyService.startStrategy(id));
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<Strategy> stopStrategy(@PathVariable UUID id) {
        return ResponseEntity.ok(strategyService.stopStrategy(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Strategy> updateStrategy(@PathVariable UUID id, @RequestBody Strategy strategy) {
        strategy.setId(id);
        return ResponseEntity.ok(strategyService.updateStrategy(strategy));
    }
}

