package com.trading.marketdata.config;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.core.registry.EntryAddedEvent;
import io.github.resilience4j.core.registry.EntryRemovedEvent;
import io.github.resilience4j.core.registry.EntryReplacedEvent;
import io.github.resilience4j.core.registry.RegistryEventConsumer;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterConfig;
import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.timelimiter.TimeLimiter;
import io.github.resilience4j.timelimiter.TimeLimiterConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Slf4j
@Configuration
public class ResilienceConfig {

    @Bean
    public RegistryEventConsumer<CircuitBreaker> circuitBreakerEventConsumer() {
        return new RegistryEventConsumer<>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<CircuitBreaker> entryAddedEvent) {
                log.info("CircuitBreaker '{}' added", entryAddedEvent.getAddedEntry().getName());
                setupCircuitBreakerLogging(entryAddedEvent.getAddedEntry());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<CircuitBreaker> entryRemoveEvent) {
                log.info("CircuitBreaker '{}' removed", entryRemoveEvent.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<CircuitBreaker> entryReplacedEvent) {
                log.info("CircuitBreaker '{}' replaced", entryReplacedEvent.getNewEntry().getName());
                setupCircuitBreakerLogging(entryReplacedEvent.getNewEntry());
            }

            private void setupCircuitBreakerLogging(CircuitBreaker circuitBreaker) {
                circuitBreaker.getEventPublisher()
                    .onStateTransition(event -> 
                        log.info("CircuitBreaker '{}' state transition from {} to {} at {}",
                            circuitBreaker.getName(),
                            event.getStateTransition().getFromState(),
                            event.getStateTransition().getToState(),
                            event.getCreationTime()))
                    .onCallNotPermitted(event ->
                        log.warn("CircuitBreaker '{}' call not permitted at {} - Circuit is OPEN",
                            circuitBreaker.getName(),
                            event.getCreationTime()))
                    .onError(event -> {
                        log.error("CircuitBreaker '{}' recorded error '{}' at {} - Duration: {}ms",
                            circuitBreaker.getName(),
                            event.getEventType().name(),
                            event.getCreationTime(),
                            event.getElapsedDuration().toMillis(),
                            event.getThrowable());
                    })
                    .onSuccess(event ->
                        log.debug("CircuitBreaker '{}' recorded successful call at {} - Duration: {}ms",
                            circuitBreaker.getName(),
                            event.getCreationTime(),
                            event.getElapsedDuration().toMillis()))
                    .onIgnoredError(event ->
                        log.warn("CircuitBreaker '{}' ignored error '{}' at {}",
                            circuitBreaker.getName(),
                            event.getEventType().name(),
                            event.getCreationTime()))
                    .onReset(event ->
                        log.info("CircuitBreaker '{}' reset at {}",
                            circuitBreaker.getName(),
                            event.getCreationTime()));
            }
        };
    }

    @Bean
    public RegistryEventConsumer<Retry> retryEventConsumer() {
        return new RegistryEventConsumer<>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<Retry> entryAddedEvent) {
                log.info("Retry '{}' added", entryAddedEvent.getAddedEntry().getName());
                setupRetryLogging(entryAddedEvent.getAddedEntry());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<Retry> entryRemoveEvent) {
                log.info("Retry '{}' removed", entryRemoveEvent.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<Retry> entryReplacedEvent) {
                log.info("Retry '{}' replaced", entryReplacedEvent.getNewEntry().getName());
                setupRetryLogging(entryReplacedEvent.getNewEntry());
            }

            private void setupRetryLogging(Retry retry) {
                retry.getEventPublisher()
                    .onRetry(event -> {
                        log.warn("Retry '{}' attempt {} of {} at {} - Error: {}",
                            retry.getName(),
                            event.getNumberOfRetryAttempts(),
                            retry.getRetryConfig().getMaxAttempts(),
                            event.getCreationTime(),
                            event.getLastThrowable().getMessage());
                    })
                    .onSuccess(event ->
                        log.info("Retry '{}' succeeded after {} attempts at {}",
                            retry.getName(),
                            event.getNumberOfRetryAttempts(),
                            event.getCreationTime()))
                    .onError(event -> {
                        log.error("Retry '{}' failed after {} attempts at {}",
                            retry.getName(),
                            event.getNumberOfRetryAttempts(),
                            event.getCreationTime(),
                            event.getLastThrowable());
                    })
                    .onIgnoredError(event ->
                        log.warn("Retry '{}' ignored error at {} - Error: {}",
                            retry.getName(),
                            event.getCreationTime(),
                            event.getLastThrowable().getMessage()));
            }
        };
    }

    @Bean
    public RegistryEventConsumer<RateLimiter> rateLimiterEventConsumer() {
        return new RegistryEventConsumer<>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<RateLimiter> entryAddedEvent) {
                log.info("RateLimiter '{}' added", entryAddedEvent.getAddedEntry().getName());
                setupRateLimiterLogging(entryAddedEvent.getAddedEntry());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<RateLimiter> entryRemoveEvent) {
                log.info("RateLimiter '{}' removed", entryRemoveEvent.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<RateLimiter> entryReplacedEvent) {
                log.info("RateLimiter '{}' replaced", entryReplacedEvent.getNewEntry().getName());
                setupRateLimiterLogging(entryReplacedEvent.getNewEntry());
            }

            private void setupRateLimiterLogging(RateLimiter rateLimiter) {
                rateLimiter.getEventPublisher()
                    .onSuccess(event ->
                        log.debug("RateLimiter '{}' permitted call at {} - Permissions: {}",
                            rateLimiter.getName(),
                            event.getCreationTime(),
                            event.getNumberOfPermits()))
                    .onFailure(event ->
                        log.warn("RateLimiter '{}' denied call at {} - Permissions: {}",
                            rateLimiter.getName(),
                            event.getCreationTime(),
                            event.getNumberOfPermits()));
            }
        };
    }

    @Bean
    public RegistryEventConsumer<TimeLimiter> timeLimiterEventConsumer() {
        return new RegistryEventConsumer<>() {
            @Override
            public void onEntryAddedEvent(EntryAddedEvent<TimeLimiter> entryAddedEvent) {
                log.info("TimeLimiter '{}' added", entryAddedEvent.getAddedEntry().getName());
                setupTimeLimiterLogging(entryAddedEvent.getAddedEntry());
            }

            @Override
            public void onEntryRemovedEvent(EntryRemovedEvent<TimeLimiter> entryRemoveEvent) {
                log.info("TimeLimiter '{}' removed", entryRemoveEvent.getRemovedEntry().getName());
            }

            @Override
            public void onEntryReplacedEvent(EntryReplacedEvent<TimeLimiter> entryReplacedEvent) {
                log.info("TimeLimiter '{}' replaced", entryReplacedEvent.getNewEntry().getName());
                setupTimeLimiterLogging(entryReplacedEvent.getNewEntry());
            }

            private void setupTimeLimiterLogging(TimeLimiter timeLimiter) {
                timeLimiter.getEventPublisher()
                    .onTimeout(event ->
                        log.error("TimeLimiter '{}' timeout at {} - Timeout duration: {}ms",
                            timeLimiter.getName(),
                            event.getCreationTime(),
                            timeLimiter.getTimeLimiterConfig().getTimeoutDuration().toMillis()))
                    .onSuccess(event ->
                        log.debug("TimeLimiter '{}' completed successfully at {}",
                            timeLimiter.getName(),
                            event.getCreationTime()));
            }
        };
    }

    @Bean
    public CircuitBreakerConfig nseApiCircuitBreakerConfig() {
        return CircuitBreakerConfig.custom()
            .failureRateThreshold(50)
            .waitDurationInOpenState(Duration.ofSeconds(30))
            .slidingWindowSize(100)
            .minimumNumberOfCalls(10)
            .automaticTransitionFromOpenToHalfOpenEnabled(true)
            .recordExceptions(Exception.class)
            .build();
    }

    @Bean
    public RetryConfig nseApiRetryConfig() {
        return RetryConfig.custom()
            .maxAttempts(3)
            .waitDuration(Duration.ofMillis(1000))
            .retryExceptions(Exception.class)
            .build();
    }

    @Bean
    public RateLimiterConfig nseApiRateLimiterConfig() {
        return RateLimiterConfig.custom()
            .limitForPeriod(10)
            .limitRefreshPeriod(Duration.ofSeconds(1))
            .timeoutDuration(Duration.ofSeconds(5))
            .build();
    }

    @Bean
    public TimeLimiterConfig nseApiTimeLimiterConfig() {
        return TimeLimiterConfig.custom()
            .timeoutDuration(Duration.ofSeconds(10))
            .build();
    }
}

