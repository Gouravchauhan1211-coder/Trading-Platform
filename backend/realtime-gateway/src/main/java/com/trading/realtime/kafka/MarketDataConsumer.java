package com.trading.realtime.kafka;

import com.trading.common.events.MarketPriceEvent;
import com.trading.realtime.service.MarketDataBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class MarketDataConsumer {

    private final MarketDataBroadcastService broadcastService;

    @KafkaListener(
            topics = "${app.kafka.topics.market-price-events}",
            groupId = "${spring.kafka.consumer.group-id}",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeMarketData(MarketPriceEvent event) {
        log.debug("Received market data: {} - {}", event.getSymbol(), event.getLastPrice());
        
        try {
            // Broadcast to WebSocket clients
            broadcastService.broadcastMarketData(event);
        } catch (Exception e) {
            log.error("Error broadcasting market data: {}", e.getMessage(), e);
        }
    }
}

