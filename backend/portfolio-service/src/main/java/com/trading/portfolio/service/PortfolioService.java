package com.trading.portfolio.service;

import com.trading.common.events.TradeExecutionEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final RedisTemplate<String, String> redisTemplate;

    // In-memory position storage (in production, use database)
    private final Map<String, Position> positions = new ConcurrentHashMap<>();

    private static final String PRICE_PREFIX = "price:";

    /**
     * Process trade execution and update positions
     */
    public void processTradeExecution(TradeExecutionEvent execution) {
        log.info("Processing trade execution: {} {} {} @ {}", 
                execution.getSide(), execution.getQuantity(), 
                execution.getSymbol(), execution.getExecutionPrice());

        String symbol = execution.getSymbol();
        Position position = positions.computeIfAbsent(symbol, k -> new Position(symbol));

        BigDecimal quantity = execution.getQuantity();
        BigDecimal price = execution.getExecutionPrice();
        BigDecimal totalAmount = execution.getTotalAmount();

        if ("BUY".equalsIgnoreCase(execution.getSide())) {
            // Update average price for buy
            BigDecimal totalCost = position.getAveragePrice().multiply(position.getQuantity())
                    .add(totalAmount);
            BigDecimal newQuantity = position.getQuantity().add(quantity);
            position.setAveragePrice(totalCost.divide(newQuantity, 2, BigDecimal.ROUND_HALF_UP));
            position.setQuantity(newQuantity);
        } else if ("SELL".equalsIgnoreCase(execution.getSide())) {
            // Reduce position for sell
            BigDecimal newQuantity = position.getQuantity().subtract(quantity);
            if (newQuantity.compareTo(BigDecimal.ZERO) <= 0) {
                positions.remove(symbol);
                log.info("Position closed for {}", symbol);
                return;
            }
            position.setQuantity(newQuantity);
        }

        // Update current price and P&L
        updatePositionPnL(position);
        
        log.info("Position updated: {} - Qty: {}, Avg: {}, Current: {}, P&L: {}", 
                symbol, position.getQuantity(), position.getAveragePrice(),
                position.getCurrentPrice(), position.getUnrealizedPnl());
    }

    /**
     * Update position P&L based on current market price
     */
    public void updatePositionPnL(Position position) {
        try {
            String priceKey = PRICE_PREFIX + position.getSymbol();
            String priceValue = redisTemplate.opsForValue().get(priceKey);
            
            if (priceValue != null) {
                BigDecimal currentPrice = new BigDecimal(priceValue);
                position.setCurrentPrice(currentPrice);
                
                // Calculate unrealized P&L
                BigDecimal costBasis = position.getAveragePrice().multiply(position.getQuantity());
                BigDecimal marketValue = currentPrice.multiply(position.getQuantity());
                position.setUnrealizedPnl(marketValue.subtract(costBasis));
            }
        } catch (Exception e) {
            log.error("Error updating P&L for {}: {}", position.getSymbol(), e.getMessage());
        }
    }

    /**
     * Get all positions
     */
    public Map<String, Object> getPortfolio() {
        // Update all positions with current prices
        positions.values().forEach(this::updatePositionPnL);

        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;

        for (Position p : positions.values()) {
            totalValue = totalValue.add(p.getCurrentPrice().multiply(p.getQuantity()));
            totalUnrealizedPnl = totalUnrealizedPnl.add(p.getUnrealizedPnl());
        }

        Map<String, Object> portfolio = new HashMap<>();
        portfolio.put("totalValue", totalValue);
        portfolio.put("unrealizedPnL", totalUnrealizedPnl);
        portfolio.put("positions", positions.values().stream().map(this::toMap).toList());
        
        return portfolio;
    }

    /**
     * Get positions list
     */
    public java.util.List<Map<String, Object>> getPositions() {
        positions.values().forEach(this::updatePositionPnL);
        return positions.values().stream().map(this::toMap).toList();
    }

    private Map<String, Object> toMap(Position p) {
        Map<String, Object> map = new HashMap<>();
        map.put("symbol", p.getSymbol());
        map.put("quantity", p.getQuantity());
        map.put("averagePrice", p.getAveragePrice());
        map.put("currentPrice", p.getCurrentPrice());
        map.put("unrealizedPnl", p.getUnrealizedPnl());
        return map;
    }

    /**
     * Inner class to represent a position
     */
    public static class Position {
        private String symbol;
        private BigDecimal quantity = BigDecimal.ZERO;
        private BigDecimal averagePrice = BigDecimal.ZERO;
        private BigDecimal currentPrice = BigDecimal.ZERO;
        private BigDecimal unrealizedPnl = BigDecimal.ZERO;

        public Position(String symbol) {
            this.symbol = symbol;
        }

        // Getters and setters
        public String getSymbol() { return symbol; }
        public void setSymbol(String symbol) { this.symbol = symbol; }
        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
        public BigDecimal getAveragePrice() { return averagePrice; }
        public void setAveragePrice(BigDecimal averagePrice) { this.averagePrice = averagePrice; }
        public BigDecimal getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
        public BigDecimal getUnrealizedPnl() { return unrealizedPnl; }
        public void setUnrealizedPnl(BigDecimal unrealizedPnl) { this.unrealizedPnl = unrealizedPnl; }
    }
}

