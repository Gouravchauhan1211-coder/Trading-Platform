package com.trading.notification_service.config;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * JPA configuration — separated from the main application class so that
 * {@code @WebMvcTest} slices can exclude JPA infrastructure without errors.
 */
@Configuration
@EnableJpaRepositories(basePackages = {
        "com.trading.notification_service.repository",
        "com.trading.common.messaging.idempotency",
        "com.trading.common.messaging.outbox"
})
@EntityScan(basePackages = {
        "com.trading.notification_service.model",
        "com.trading.common.messaging.idempotency",
        "com.trading.common.messaging.outbox"
})
public class JpaConfig {
}

