package com.trading.realtime.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.common.events.MarketPriceEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MarketDataBroadcastService {

    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Broadcast market data to all connected WebSocket clients
     */
    public void broadcastMarketData(MarketPriceEvent event) {
        try {
            // Create a simplified message for the frontend
            Map<String, Object> message = new HashMap<>();
            message.put("symbol", event.getSymbol());
            message.put("price", event.getLastPrice());
            message.put("volume", event.getVolume());
            message.put("timestamp", event.getTimestamp());
            
            if (event.getExchange() != null) {
                message.put("exchange", event.getExchange());
            }
            if (event.getHighPrice() != null) {
                message.put("high", event.getHighPrice());
            }
            if (event.getLowPrice() != null) {
                message.put("low", event.getLowPrice());
            }
            if (event.getOpenPrice() != null) {
                message.put("open", event.getOpenPrice());
            }
            if (event.getClosePrice() != null) {
                message.put("close", event.getClosePrice());
            }

            // Broadcast to /topic/market-data
            messagingTemplate.convertAndSend("/topic/market-data", message);
            
            // Also send to symbol-specific topic for selective subscriptions
            messagingTemplate.convertAndSend("/topic/market-data/" + event.getSymbol(), message);
            
            log.debug("Broadcasted market data for {}", event.getSymbol());
        } catch (Exception e) {
            log.error("Error broadcasting market data: {}", e.getMessage(), e);
        }
    }
}

