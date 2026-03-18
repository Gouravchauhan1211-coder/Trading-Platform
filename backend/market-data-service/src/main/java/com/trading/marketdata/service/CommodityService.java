package com.trading.marketdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.marketdata.entity.CommodityData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommodityService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Fetch real-time commodity data (Gold, Silver, Crude Oil, etc.)
     */
    public List<CommodityData> getAllCommodities() {
        log.info("Fetching real-time commodity data...");
        List<CommodityData> commodities = new ArrayList<>();
        
        // Try fetching from MCX India (Multi Commodity Exchange)
        try {
            commodities.addAll(fetchFromMCX());
        } catch (Exception e) {
            log.warn("Failed to fetch from MCX: {}", e.getMessage());
        }
        
        // Try fetching from NCDEX (National Commodity & Derivatives Exchange)
        try {
            commodities.addAll(fetchFromNCDEX());
        } catch (Exception e) {
            log.warn("Failed to fetch from NCDEX: {}", e.getMessage());
        }
        
        // Try fetching from NSE (for commodity ETFs)
        try {
            commodities.addAll(fetchCommodityETFs());
        } catch (Exception e) {
            log.warn("Failed to fetch commodity ETFs: {}", e.getMessage());
        }
        
        log.info("Successfully fetched {} commodity records", commodities.size());
        return commodities;
    }

    /**
     * Fetch from MCX India
     */
    private List<CommodityData> fetchFromMCX() {
        List<CommodityData> mcxList = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // MCX Live Data API
            String url = "https://api.mcxindia.com/marketdata/live";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                // Parse commodity data
                String[] mcxCommodities = {"GOLD", "SILVER", "CRUDEOIL", "NATURALGAS", "COPPER", "ZINC", "NICKEL", "LEAD"};
                
                for (String commodity : mcxCommodities) {
                    JsonNode data = root.path(commodity);
                    if (!data.isMissingNode()) {
                        CommodityData cd = CommodityData.builder()
                            .symbol(commodity)
                            .name(getCommodityName(commodity))
                            .exchange("MCX")
                            .lastPrice(data.path("lastPrice").asDouble(0))
                            .change(data.path("change").asDouble(0))
                            .changePercent(data.path("pChange").asDouble(0))
                            .open(data.path("open").asDouble(0))
                            .high(data.path("high").asDouble(0))
                            .low(data.path("low").asDouble(0))
                            .closePrice(data.path("close").asDouble(0))
                            .volume(data.path("volume").asLong(0))
                            .lastUpdated(LocalDateTime.now())
                            .build();
                        mcxList.add(cd);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("MCX fetch failed: {}", e.getMessage());
        }
        
        return mcxList;
    }

    /**
     * Fetch from NCDEX
     */
    private List<CommodityData> fetchFromNCDEX() {
        List<CommodityData> ncdexList = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // NCDEX Live Data
            String url = "https://api.ncdex.com/marketdata/live";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                // Parse agricultural commodities
                String[] ncdexCommodities = {"GUARGUM5", "GUARSEED10", "CASTORSEED", "COTTON", "SOYBEAN", "WHEAT", "RICE"};
                
                for (String commodity : ncdexCommodities) {
                    JsonNode data = root.path(commodity);
                    if (!data.isMissingNode()) {
                        CommodityData cd = CommodityData.builder()
                            .symbol(commodity)
                            .name(getCommodityName(commodity))
                            .exchange("NCDEX")
                            .lastPrice(data.path("lastPrice").asDouble(0))
                            .change(data.path("change").asDouble(0))
                            .changePercent(data.path("pChange").asDouble(0))
                            .open(data.path("open").asDouble(0))
                            .high(data.path("high").asDouble(0))
                            .low(data.path("low").asDouble(0))
                            .closePrice(data.path("close").asDouble(0))
                            .volume(data.path("volume").asLong(0))
                            .lastUpdated(LocalDateTime.now())
                            .build();
                        ncdexList.add(cd);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("NCDEX fetch failed: {}", e.getMessage());
        }
        
        return ncdexList;
    }

    /**
     * Fetch commodity ETFs from NSE
     */
    private List<CommodityData> fetchCommodityETFs() {
        List<CommodityData> commodities = new ArrayList<>();
        
        // Commodity ETFs available on NSE
        String[] etfSymbols = {"GOLDBEES", "SILVERBEES", "GOLDETF", "GOLDFSHARE"};
        
        for (String symbol : etfSymbols) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.set("User-Agent", "Mozilla/5.0");
                headers.set("Accept", "application/json");
                headers.set("Referer", "https://www.nseindia.com/");
                
                HttpEntity<String> entity = new HttpEntity<>(headers);
                
                String url = "https://www.nseindia.com/api/quote-equity?symbol=" + symbol;
                ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
                
                if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode priceInfo = root.path("priceInfo");
                    
                    CommodityData cd = CommodityData.builder()
                        .symbol(symbol)
                        .name(root.path("info").path("companyName").asText(symbol))
                        .exchange("NSE")
                        .lastPrice(priceInfo.path("lastPrice").asDouble(0))
                        .change(priceInfo.path("change").asDouble(0))
                        .changePercent(priceInfo.path("pChange").asDouble(0))
                        .open(priceInfo.path("open").asDouble(0))
                        .high(priceInfo.path("high").asDouble(0))
                        .low(priceInfo.path("low").asDouble(0))
                        .closePrice(priceInfo.path("close").asDouble(0))
                        .volume(priceInfo.path("v").asLong(0))
                        .lastUpdated(LocalDateTime.now())
                        .build();
                    commodities.add(cd);
                }
            } catch (Exception e) {
                log.debug("Failed to fetch {}: {}", symbol, e.getMessage());
            }
        }
        
        return commodities;
    }

    private String getCommodityName(String symbol) {
        switch (symbol) {
            case "GOLD": return "Gold";
            case "SILVER": return "Silver";
            case "CRUDEOIL": return "Crude Oil";
            case "NATURALGAS": return "Natural Gas";
            case "COPPER": return "Copper";
            case "ZINC": return "Zinc";
            case "NICKEL": return "Nickel";
            case "LEAD": return "Lead";
            case "GUARGUM5": return "Guar Gum";
            case "GUARSEED10": return "Guar Seed";
            case "CASTORSEED": return "Castor Seed";
            case "COTTON": return "Cotton";
            case "SOYBEAN": return "Soybean";
            case "WHEAT": return "Wheat";
            case "RICE": return "Rice";
            case "GOLDBEES": return "Gold Bees ETF";
            case "SILVERBEES": return "Silver Bees ETF";
            default: return symbol;
        }
    }
}

