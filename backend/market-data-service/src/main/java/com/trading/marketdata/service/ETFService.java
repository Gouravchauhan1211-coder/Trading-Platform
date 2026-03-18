package com.trading.marketdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.marketdata.entity.ETFData;
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
public class ETFService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Popular Indian ETFs
    private static final String[] ETF_SYMBOLS = {
        "NIFTYBEES", "NASDAQ100", "GOLDBEES", "SILVERBEES", 
        "NIFTYSMLCAP", "MIDCAPBEES", "BANKBEES", "PSUBANK",
        "ITBEES", "PHARMA", "FMCG", "AUTO"
    };

    /**
     * Fetch real-time ETF data from NSE India
     */
    public List<ETFData> getAllETFs() {
        log.info("Fetching real-time ETF data from NSE India...");
        List<ETFData> etfList = new ArrayList<>();
        
        for (String symbol : ETF_SYMBOLS) {
            try {
                ETFData etf = fetchETFData(symbol);
                if (etf != null) {
                    etfList.add(etf);
                }
            } catch (Exception e) {
                log.debug("Failed to fetch ETF {}: {}", symbol, e.getMessage());
            }
        }
        
        log.info("Successfully fetched {} ETF records", etfList.size());
        return etfList;
    }

    /**
     * Fetch data for a single ETF
     */
    public ETFData fetchETFData(String symbol) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json");
            headers.set("Referer", "https://www.nseindia.com/");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // NSE India Quote API for ETF
            String url = "https://www.nseindia.com/api/quote-equity?symbol=" + symbol;
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                return parseETFResponse(root, symbol);
            }
        } catch (Exception e) {
            log.debug("Failed to fetch ETF data for {}: {}", symbol, e.getMessage());
        }
        
        return null;
    }

    /**
     * Parse ETF response
     */
    private ETFData parseETFResponse(JsonNode root, String symbol) {
        JsonNode info = root.path("info");
        JsonNode metadata = root.path("metadata");
        JsonNode priceInfo = root.path("priceInfo");
        
        double lastPrice = priceInfo.path("lastPrice").asDouble(0);
        double change = priceInfo.path("change").asDouble(0);
        double changePercent = priceInfo.path("pChange").asDouble(0);
        long volume = priceInfo.path("v").asLong(0);
        double open = priceInfo.path("open").asDouble(0);
        double high = priceInfo.path("high").asDouble(0);
        double low = priceInfo.path("low").asDouble(0);
        double close = priceInfo.path("close").asDouble(lastPrice);
        
        return ETFData.builder()
            .symbol(symbol)
            .name(info.path("companyName").asText(symbol))
            .lastPrice(lastPrice)
            .change(change)
            .changePercent(changePercent)
            .volume(volume)
            .open(open)
            .high(high)
            .low(low)
            .closePrice(close)
            .lastUpdated(LocalDateTime.now())
            .build();
    }

    /**
     * Get ETF by symbol
     */
    public ETFData getETFBySymbol(String symbol) {
        return fetchETFData(symbol.toUpperCase());
    }
}

