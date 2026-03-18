package com.trading.report_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Report Service Application
 * 
 * Provides async report generation for:
 * - P&L Statements (realized + unrealized)
 * - Tax Reports (STCG/LTCG for Indian compliance)
 * - Transaction History
 * - Holdings Summary
 * - Trade History
 * 
 * Uses Event Sourcing pattern to build local projection tables
 * from domain events received via RabbitMQ.
 */
@SpringBootApplication(scanBasePackages = {
                "com.trading.report_service",
                "com.trading.common"
})
@EnableDiscoveryClient
@EnableAsync
@EnableScheduling
@EnableJpaRepositories(basePackages = {
                "com.trading.report_service.repository",
                "com.trading.common.messaging.idempotency",
                "com.trading.common.messaging.outbox"
})
@EntityScan(basePackages = {
                "com.trading.report_service.model",
                "com.trading.report_service.entity",
                "com.trading.common.messaging.idempotency",
                "com.trading.common.messaging.outbox"
})
public class ReportServiceApplication {

        public static void main(String[] args) {
                SpringApplication.run(ReportServiceApplication.class, args);
        }
}

