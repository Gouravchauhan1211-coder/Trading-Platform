package com.trading.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Order event for Kafka
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String orderId;
    private String userId;
    private String strategyId;
    private String symbol;
    private String exchange;
    private OrderSide side;
    private OrderType orderType;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal stopPrice;
    private OrderStatus status;
    private String tradingMode;
    private boolean requiresApproval;
    private Instant createdAt;
    private Instant updatedAt;
    private String externalOrderId;
    private String errorMessage;

    public enum OrderSide {
        BUY, SELL
    }

    public enum OrderType {
        MARKET, LIMIT, STOP, STOP_LIMIT
    }

    public enum OrderStatus {
        PENDING, APPROVED, REJECTED, SUBMITTED, FILLED, PARTIALLY_FILLED, CANCELLED, EXPIRED, FAILED
    }
}

