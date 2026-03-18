package com.trading.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Position update event published after trade execution
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionUpdateEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String positionId;
    private String userId;
    private String symbol;
    private String exchange;
    private BigDecimal quantity;
    private BigDecimal avgPrice;
    private BigDecimal marketValue;
    private BigDecimal unrealizedPnl;
    private BigDecimal realizedPnl;
    private BigDecimal previousQuantity;
    private BigDecimal previousAvgPrice;
    private String updateType;
    private Instant timestamp;

    public enum UpdateType {
        OPEN, ADD, REDUCE, CLOSE
    }
}

