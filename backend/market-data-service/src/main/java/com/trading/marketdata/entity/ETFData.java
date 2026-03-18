package com.trading.marketdata.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ETFData {
    
    private String symbol;
    private String name;
    private double lastPrice;
    private double change;
    private double changePercent;
    private long volume;
    private double open;
    private double high;
    private double low;
    private double closePrice;
    private LocalDateTime lastUpdated;
}

