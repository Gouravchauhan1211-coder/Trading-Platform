package com.trading.marketdata.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MutualFundData {
    
    private String schemeCode;
    private String schemeName;
    private String category;
    private double nav;
    private double navChange;
    private double navChangePercent;
    private double ytdReturn;
    private double oneYearReturn;
    private double threeYearReturn;
    private double fiveYearReturn;
    private long assets;
    private LocalDate lastUpdated;
}

