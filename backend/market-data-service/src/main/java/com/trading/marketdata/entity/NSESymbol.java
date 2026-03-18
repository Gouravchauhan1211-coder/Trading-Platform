package com.trading.marketdata.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "nse_symbols")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NSESymbol {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(nullable = false, length = 200)
    private String companyName;

    @Column(length = 50)
    private String series;

    @Column(name = "listing_date")
    private String listingDate;

    @Column(name = "paid_up_value")
    private BigDecimal paidUpValue;

    @Column(name = "market_lot")
    private Integer marketLot;

    @Column(name = "isin_code", length = 20)
    private String isinCode;

    @Column(name = "face_value")
    private BigDecimal faceValue;

    @Column(name = "stock_exchange", length = 10)
    private String stockExchange;

    @Column(name = "industry")
    private String industry;

    @Column(name = "sector")
    private String sector;

    @Column(name = "market_cap")
    private BigDecimal marketCap;

    @Column(name = "tick_size")
    private BigDecimal tickSize;

    @Column(name = "upper_circuit")
    private BigDecimal upperCircuit;

    @Column(name = "lower_circuit")
    private BigDecimal lowerCircuit;

    @Column(name = "price_band")
    private String priceBand;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "last_updated")
    private Instant lastUpdated;
}

