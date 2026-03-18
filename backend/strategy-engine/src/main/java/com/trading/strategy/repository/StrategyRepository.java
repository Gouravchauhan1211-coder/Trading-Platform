package com.trading.strategy.repository;

import com.trading.strategy.entity.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, UUID> {
    List<Strategy> findByUserId(UUID userId);
    List<Strategy> findByStatus(String status);
    List<Strategy> findByUserIdAndStatus(UUID userId, String status);
}

