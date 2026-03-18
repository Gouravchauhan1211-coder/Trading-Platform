package com.trading.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Market price event published to Kafka
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketPriceEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private String symbol;
    private String exchange;
    private BigDecimal lastPrice;
    private BigDecimal openPrice;
    private BigDecimal highPrice;
    private BigDecimal lowPrice;
    private BigDecimal closePrice;
    private Long volume;
    private BigDecimal bidPrice;
    private BigDecimal askPrice;
    private BigDecimal bidQuantity;
    private BigDecimal askQuantity;
    private Instant timestamp;
    private String dataSource;
}

