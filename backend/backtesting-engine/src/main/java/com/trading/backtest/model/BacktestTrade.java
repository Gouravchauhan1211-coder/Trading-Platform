package com.trading.backtest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BacktestTrade {
    private int tradeNumber;
    private String symbol;
    private String side;
    private BigDecimal entryPrice;
    private BigDecimal exitPrice;
    private BigDecimal quantity;
    private BigDecimal pnl;
    private BigDecimal brokerage;
    private BigDecimal netPnl;
    private Instant entryTime;
    private Instant exitTime;
    private int holdingPeriod;
}

