package com.trading.marketdata.repository;

import com.trading.marketdata.entity.MarketData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MarketDataRepository extends JpaRepository<MarketData, UUID> {
    Optional<MarketData> findBySymbolAndExchange(String symbol, String exchange);
    
    @Query("SELECT DISTINCT m.symbol FROM MarketData m ORDER BY m.symbol")
    List<String> findAllSymbols();
    
    List<MarketData> findBySymbolIn(List<String> symbols);
}

