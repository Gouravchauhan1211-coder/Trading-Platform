package com.trading.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Trade execution event published after order is filled
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeExecutionEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String tradeId;
    private String orderId;
    private String userId;
    private String strategyId;
    private String symbol;
    private String exchange;
    private String side;
    private BigDecimal executionPrice;
    private BigDecimal quantity;
    private BigDecimal commission;
    private BigDecimal totalAmount;
    private String externalTradeId;
    private Instant executedAt;
    private String status;
}

