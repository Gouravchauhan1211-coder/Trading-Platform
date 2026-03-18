package com.trading.common;

/**
 * Kafka topic constants for the trading platform
 */
public final class KafkaTopics {

    private KafkaTopics() {
    }

    // Market Data
    public static final String MARKET_PRICE_EVENTS = "market-price-events";

    // Trade Signals
    public static final String TRADE_SIGNALS = "trade-signals";
    public static final String TRADE_SIGNALS_DLQ = "trade-signals-dlq";

    // Orders
    public static final String ORDERS = "orders";
    public static final String ORDERS_DLQ = "orders-dlq";

    // Trade Executions
    public static final String TRADE_EXECUTIONS = "trade-executions";

    // Position Updates
    public static final String POSITION_UPDATES = "position-updates";

    // Risk
    public static final String RISK_CHECKS = "risk-checks";
    public static final String RISK_VALIDATION_RESULTS = "risk-validation-results";
}

