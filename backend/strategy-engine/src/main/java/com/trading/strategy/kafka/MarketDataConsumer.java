package com.trading.strategy.kafka;

import com.trading.common.events.MarketPriceEvent;
import com.trading.strategy.service.StrategyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import static com.trading.common.KafkaTopics.MARKET_PRICE_EVENTS;

@Slf4j
@Component
@RequiredArgsConstructor
public class MarketDataConsumer {

    private final StrategyService strategyService;

    @KafkaListener(topics = MARKET_PRICE_EVENTS, groupId = "strategy-engine-group")
    public void consumeMarketData(MarketPriceEvent event) {
        log.debug("Received market data for {}: {}", event.getSymbol(), event.getLastPrice());
        strategyService.processMarketData(event);
    }
}

