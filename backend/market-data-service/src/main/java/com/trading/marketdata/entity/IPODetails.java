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
public class IPODetails {
    
    private String id;
    private String name;
    private String priceBand;
    private int lotSize;
    private LocalDate openDate;
    private LocalDate closeDate;
    private String status;
    private String exchange;
    private long issueSize;
    private String description;
}

