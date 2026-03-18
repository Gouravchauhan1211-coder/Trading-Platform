package com.trading.strategy.entity;

import com.trading.common.convert.MapToJsonConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "strategies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Strategy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "strategy_type", nullable = false)
    private String strategyType;

    @Convert(converter = MapToJsonConverter.class)
    @Column(columnDefinition = "TEXT")
    @Builder.Default
    private Map<String, Object> parameters = Collections.emptyMap();

    @Column(name = "trading_mode")
    @Builder.Default
    private String tradingMode = "MANUAL";

    @Column
    @Builder.Default
    private String status = "STOPPED";

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}

