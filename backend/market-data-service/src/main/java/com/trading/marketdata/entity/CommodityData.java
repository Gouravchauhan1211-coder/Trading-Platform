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
public class CommodityData {
    
    private String symbol;
    private String name;
    private String exchange;
    private double lastPrice;
    private double change;
    private double changePercent;
    private double open;
    private double high;
    private double low;
    private double closePrice;
    private long volume;
    private LocalDateTime lastUpdated;
}

