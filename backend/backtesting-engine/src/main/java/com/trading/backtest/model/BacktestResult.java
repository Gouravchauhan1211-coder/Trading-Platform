package com.trading.backtest.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BacktestResult {
    private UUID id;
    private UUID strategyId;
    private String symbol;
    private Instant startDate;
    private Instant endDate;
    private BigDecimal initialCapital;
    private BigDecimal finalCapital;
    private BigDecimal totalReturn;
    private BigDecimal sharpeRatio;
    private BigDecimal maxDrawdown;
    private BigDecimal winRate;
    private BigDecimal profitFactor;
    private int totalTrades;
    private int winningTrades;
    private int losingTrades;
    private List<BacktestTrade> trades;
    private List<EquityCurvePoint> equityCurve;
    private Instant completedAt;
}

