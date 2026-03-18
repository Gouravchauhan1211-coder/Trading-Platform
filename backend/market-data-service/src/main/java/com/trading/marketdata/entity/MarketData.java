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
@Table(name = "market_data")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketData {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String symbol;

    @Column(nullable = false, length = 10)
    private String exchange;

    @Column(name = "last_price")
    private BigDecimal lastPrice;

    @Column(name = "open_price")
    private BigDecimal openPrice;

    @Column(name = "high_price")
    private BigDecimal highPrice;

    @Column(name = "low_price")
    private BigDecimal lowPrice;

    @Column(name = "close_price")
    private BigDecimal closePrice;

    private Long volume;

    @Column(name = "bid_price")
    private BigDecimal bidPrice;

    @Column(name = "ask_price")
    private BigDecimal askPrice;

    @Column(name = "bid_quantity")
    private BigDecimal bidQuantity;

    @Column(name = "ask_quantity")
    private BigDecimal askQuantity;

    @Column(name = "change_amount")
    private BigDecimal changeAmount;

    @Column(name = "change_percentage")
    private BigDecimal changePercentage;

    @Column(name = "year_high")
    private BigDecimal yearHigh;

    @Column(name = "year_low")
    private BigDecimal yearLow;

    @Column(name = "total_buy_quantity")
    private Long totalBuyQuantity;

    @Column(name = "total_sell_quantity")
    private Long totalSellQuantity;

    @Column(name = "average_price")
    private BigDecimal averagePrice;

    @Column(name = "delivery_quantity")
    private Long deliveryQuantity;

    @Column(name = "delivery_percentage")
    private BigDecimal deliveryPercentage;

    @Column(name = "market_status")
    private String marketStatus;

    @Column(nullable = false)
    private Instant timestamp;
}

