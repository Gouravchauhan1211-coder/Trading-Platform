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
public class EquityCurvePoint {
    private Instant timestamp;
    private BigDecimal equity;
    private BigDecimal drawdown;
}

