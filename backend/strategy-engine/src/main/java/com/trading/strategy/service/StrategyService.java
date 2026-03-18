package com.trading.strategy.service;

import com.trading.common.events.MarketPriceEvent;
import com.trading.common.events.TradeSignalEvent;
import com.trading.strategy.entity.Strategy;
import com.trading.strategy.repository.StrategyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.trading.common.KafkaTopics.TRADE_SIGNALS;

@Slf4j
@Service
@RequiredArgsConstructor
public class StrategyService {

    private final StrategyRepository strategyRepository;
    private final KafkaTemplate<String, TradeSignalEvent> kafkaTemplate;

    public Strategy createStrategy(Strategy strategy) {
        return strategyRepository.save(strategy);
    }

    public Strategy updateStrategy(Strategy strategy) {
        return strategyRepository.save(strategy);
    }

    public List<Strategy> getStrategiesByUser(UUID userId) {
        return strategyRepository.findByUserId(userId);
    }

    public List<Strategy> getActiveStrategies() {
        return strategyRepository.findByStatus("RUNNING");
    }

    public Strategy startStrategy(UUID strategyId) {
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new IllegalArgumentException("Strategy not found"));
        strategy.setStatus("RUNNING");
        return strategyRepository.save(strategy);
    }

    public Strategy stopStrategy(UUID strategyId) {
        Strategy strategy = strategyRepository.findById(strategyId)
                .orElseThrow(() -> new IllegalArgumentException("Strategy not found"));
        strategy.setStatus("STOPPED");
        return strategyRepository.save(strategy);
    }

    public void processMarketData(MarketPriceEvent marketData) {
        List<Strategy> activeStrategies = getActiveStrategies();

        for (Strategy strategy : activeStrategies) {
            try {
                TradeSignalEvent signal = evaluateStrategy(strategy, marketData);
                if (signal != null) {
                    kafkaTemplate.send(TRADE_SIGNALS, signal.getSymbol(), signal);
                    log.info("Generated signal: {} {} {} from strategy {}",
                            signal.getSignalType(), signal.getQuantity(),
                            signal.getSymbol(), strategy.getName());
                }
            } catch (Exception e) {
                log.error("Error processing strategy {}: {}", strategy.getName(), e.getMessage());
            }
        }
    }

    private TradeSignalEvent evaluateStrategy(Strategy strategy, MarketPriceEvent marketData) {
        // Simple example strategy - in production, implement more sophisticated logic
        Map<String, Object> params = strategy.getParameters();
        String strategyType = strategy.getStrategyType();

        switch (strategyType) {
            case "MOVING_AVERAGE_CROSSOVER":
                return evaluateMovingAverageCrossover(strategy, marketData, params);
            case "RSI":
                return evaluateRSI(strategy, marketData, params);
            default:
                return null;
        }
    }

    private TradeSignalEvent evaluateMovingAverageCrossover(Strategy strategy,
                                                            MarketPriceEvent marketData,
                                                            Map<String, Object> params) {
        // Simplified moving average logic
        BigDecimal price = marketData.getLastPrice();
        if (price == null) return null;

        // Generate a BUY signal when price crosses above moving average
        // This is a simplified example
        BigDecimal threshold = params.containsKey("buyThreshold")
                ? new BigDecimal(params.get("buyThreshold").toString())
                : BigDecimal.valueOf(0.02);

        // For demonstration, generate BUY signal
        return TradeSignalEvent.builder()
                .signalId(UUID.randomUUID().toString())
                .strategyId(strategy.getId().toString())
                .strategyName(strategy.getName())
                .symbol(marketData.getSymbol())
                .exchange(marketData.getExchange())
                .signalType(TradeSignalEvent.SignalType.BUY)
                .price(price)
                .quantity(new BigDecimal(params.getOrDefault("quantity", "10").toString()))
                .confidence(BigDecimal.valueOf(0.75))
                .tradingMode(TradeSignalEvent.TradingMode.valueOf(strategy.getTradingMode()))
                .requiresApproval("SEMI_AUTOMATED".equals(strategy.getTradingMode()))
                .userId(strategy.getUserId().toString())
                .parameters(params)
                .timestamp(Instant.now())
                .build();
    }

    private TradeSignalEvent evaluateRSI(Strategy strategy,
                                        MarketPriceEvent marketData,
                                        Map<String, Object> params) {
        // Simplified RSI logic - in production, calculate RSI from historical data
        return null;
    }
}

