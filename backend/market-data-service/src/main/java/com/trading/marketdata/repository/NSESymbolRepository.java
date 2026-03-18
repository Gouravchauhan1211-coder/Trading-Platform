package com.trading.marketdata.repository;

import com.trading.marketdata.entity.NSESymbol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NSESymbolRepository extends JpaRepository<NSESymbol, UUID> {
    
    Optional<NSESymbol> findBySymbol(String symbol);
    
    @Query("SELECT s FROM NSESymbol s WHERE LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY s.symbol")
    List<NSESymbol> searchBySymbolOrName(String query);
    
    @Query("SELECT s FROM NSESymbol s WHERE LOWER(s.symbol) LIKE LOWER(CONCAT(:prefix, '%')) ORDER BY s.symbol")
    List<NSESymbol> findBySymbolStartingWithIgnoreCase(String prefix);
    
    List<NSESymbol> findAllByOrderBySymbolAsc();
}

