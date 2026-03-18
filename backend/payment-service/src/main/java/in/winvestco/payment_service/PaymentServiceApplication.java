package com.trading.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Payment Service Application
 * 
 * Handles payment lifecycle with Razorpay integration:
 * - Initiates payments
 * - Verifies webhooks
 * - Marks payment status (SUCCESS/FAILED/EXPIRED)
 * - Emits payment events
 * 
 * Does NOT update balance directly - emits events for funds-service.
 */
@SpringBootApplication(scanBasePackages = {
        "com.trading.payment_service",
        "com.trading.common"
})
@EnableDiscoveryClient
@EnableFeignClients
@EnableScheduling
@EnableJpaRepositories(basePackages = {
        "com.trading.payment_service.repository",
        "com.trading.common.messaging.idempotency",
        "com.trading.common.messaging.outbox"
})
@EntityScan(basePackages = {
        "com.trading.payment_service.model",
        "com.trading.common.messaging.idempotency",
        "com.trading.common.messaging.outbox"
})
public class PaymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PaymentServiceApplication.class, args);
    }
}

