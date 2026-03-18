package com.trading.order.service;

import com.trading.common.events.OrderEvent;
import com.trading.common.events.TradeExecutionEvent;
import com.trading.common.KafkaTopics;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final RedisTemplate<String, String> redisTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${app.market-data-service.url:http://localhost:8082}")
    private String marketDataServiceUrl;

    @Value("${app.trading.mode:SIMULATION}")
    private String tradingMode;

    private static final String PRICE_CACHE_PREFIX = "price:";

    /**
     * Create and execute an order in simulation mode
     */
    public OrderEvent createOrder(OrderEvent order) {
        log.info("Creating order: {} {} {} @ {}", 
                order.getSide(), order.getQuantity(), order.getSymbol(), order.getOrderType());

        order.setOrderId(UUID.randomUUID().toString());
        order.setCreatedAt(Instant.now());
        order.setTradingMode(tradingMode);

        try {
            // Get execution price from Redis cache
            BigDecimal executionPrice = getExecutionPrice(order);
            
            if (executionPrice == null) {
                order.setStatus(OrderEvent.OrderStatus.REJECTED);
                order.setErrorMessage("Price not available for symbol: " + order.getSymbol());
                log.error("Cannot execute order - price not available for {}", order.getSymbol());
                return order;
            }

            // Set the price for limit orders, use market price for market orders
            if (order.getOrderType() == OrderEvent.OrderType.MARKET) {
                order.setPrice(executionPrice);
            }

            // In simulation mode, immediately fill the order
            if ("SIMULATION".equalsIgnoreCase(tradingMode)) {
                order.setStatus(OrderEvent.OrderStatus.FILLED);
                order.setUpdatedAt(Instant.now());
                
                // Create and publish trade execution event
                TradeExecutionEvent execution = createTradeExecution(order, executionPrice);
                publishTradeExecution(execution);
                
                log.info("Order {} filled at price {}", order.getOrderId(), executionPrice);
            } else {
                // In live mode, submit to broker
                order.setStatus(OrderEvent.OrderStatus.SUBMITTED);
                // TODO: Integrate with broker API
                log.warn("Live trading not implemented yet");
            }

        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            order.setStatus(OrderEvent.OrderStatus.FAILED);
            order.setErrorMessage(e.getMessage());
        }

        return order;
    }

    /**
     * Get execution price from Redis cache or market-data-service
     */
    private BigDecimal getExecutionPrice(OrderEvent order) {
        try {
            // First try Redis cache
            String priceKey = PRICE_CACHE_PREFIX + order.getSymbol();
            String priceValue = redisTemplate.opsForValue().get(priceKey);
            
            if (priceValue != null) {
                return new BigDecimal(priceValue);
            }
            
            // If not in cache, try to get from market-data-service via REST
            log.warn("Price not found in cache for symbol: {}, trying market-data-service", order.getSymbol());
            
            try {
                String url = marketDataServiceUrl + "/api/market-data/" + order.getSymbol();
                @SuppressWarnings("unchecked")
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                
                if (response != null && response.get("lastPrice") != null) {
                    Object priceObj = response.get("lastPrice");
                    BigDecimal price;
                    if (priceObj instanceof Number) {
                        price = new BigDecimal(((Number) priceObj).doubleValue());
                    } else {
                        price = new BigDecimal(priceObj.toString());
                    }
                    log.info("Found price from market-data-service for {}: {}", order.getSymbol(), price);
                    return price;
                }
            } catch (Exception e) {
                log.error("Error calling market-data-service: {}", e.getMessage());
            }
            
            // If not available via REST either, return a default price for simulation
            log.warn("Price not found for symbol: {}. Using default simulation price.", order.getSymbol());
            return BigDecimal.valueOf(100.0);
            
        } catch (Exception e) {
            log.error("Error getting price: {}", e.getMessage());
            // Allow orders with default price in simulation mode
            return BigDecimal.valueOf(100.0);
        }
    }

    /**
     * Create trade execution event
     */
    private TradeExecutionEvent createTradeExecution(OrderEvent order, BigDecimal executionPrice) {
        BigDecimal totalAmount = executionPrice.multiply(order.getQuantity());
        BigDecimal commission = totalAmount.multiply(BigDecimal.valueOf(0.001)); // 0.1% brokerage

        return TradeExecutionEvent.builder()
                .tradeId(UUID.randomUUID().toString())
                .orderId(order.getOrderId())
                .userId(order.getUserId())
                .strategyId(order.getStrategyId())
                .symbol(order.getSymbol())
                .exchange(order.getExchange() != null ? order.getExchange() : "NSE")
                .side(order.getSide().name())
                .executionPrice(executionPrice)
                .quantity(order.getQuantity())
                .commission(commission)
                .totalAmount(totalAmount)
                .executedAt(Instant.now())
                .status("FILLED")
                .build();
    }

    /**
     * Publish trade execution event to Kafka
     */
    private void publishTradeExecution(TradeExecutionEvent execution) {
        try {
            kafkaTemplate.send(
                    KafkaTopics.TRADE_EXECUTIONS,
                    execution.getSymbol(),
                    execution
            );
            log.info("Published trade execution event: {}", execution.getTradeId());
        } catch (Exception e) {
            log.error("Error publishing trade execution: {}", e.getMessage(), e);
        }
    }

    /**
     * Get current trading mode
     */
    public String getTradingMode() {
        return tradingMode;
    }
}

