package com.trading.marketdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.marketdata.entity.MutualFundData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MutualFundService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Fetch mutual fund data from AMFI India
     */
    public List<MutualFundData> getAllMutualFunds() {
        log.info("Fetching real-time mutual fund data from AMFI...");
        List<MutualFundData> funds = new ArrayList<>();
        
        try {
            funds.addAll(fetchFromAMFI());
        } catch (Exception e) {
            log.warn("Failed to fetch from AMFI: {}", e.getMessage());
        }
        
        log.info("Successfully fetched {} mutual fund records", funds.size());
        return funds;
    }

    /**
     * Fetch from AMFI India
     */
    private List<MutualFundData> fetchFromAMFI() {
        List<MutualFundData> funds = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // AMFI India NAV API
            String url = "https://www.amfiindia.com/spages/NAVAll.json";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse AMFI NAV JSON response
                String json = response.getBody();
                
                // Simple parsing - split by newline and parse each scheme
                String[] lines = json.split("\n");
                
                for (String line : lines) {
                    if (line.contains("Scheme Code") && line.contains(":")) {
                        try {
                            MutualFundData mf = parseAMFIScheme(line);
                            if (mf != null) {
                                funds.add(mf);
                            }
                        } catch (Exception e) {
                            // Skip malformed entries
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("AMFI fetch failed: {}", e.getMessage());
        }
        
        return funds;
    }

    private MutualFundData parseAMFIScheme(String line) {
        try {
            // Simple key-value parsing
            String schemeCode = extractValue(line, "Scheme Code");
            String schemeName = extractValue(line, "Scheme Name");
            
            if (schemeCode == null || schemeCode.isEmpty()) {
                return null;
            }
            
            return MutualFundData.builder()
                .schemeCode(schemeCode)
                .schemeName(schemeName != null ? schemeName : schemeCode)
                .category(extractValue(line, "Category"))
                .nav(parseDouble(extractValue(line, "Net Asset Value")))
                .navChange(parseDouble(extractValue(line, "Previous NAV")))
                .navChangePercent(0.0) // Calculate if needed
                .ytdReturn(parseDouble(extractValue(line, "YTD Return")))
                .oneYearReturn(parseDouble(extractValue(line, "1 Year Return")))
                .threeYearReturn(parseDouble(extractValue(line, "3 Year Return")))
                .fiveYearReturn(parseDouble(extractValue(line, "5 Year Return")))
                .assets(0)
                .lastUpdated(LocalDate.now())
                .build();
        } catch (Exception e) {
            return null;
        }
    }

    private String extractValue(String line, String key) {
        try {
            int keyIndex = line.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return null;
            
            int colonIndex = line.indexOf(":", keyIndex);
            if (colonIndex == -1) return null;
            
            int startQuote = line.indexOf("\"", colonIndex);
            int endQuote = line.indexOf("\"", startQuote + 1);
            
            if (startQuote == -1 || endQuote == -1) return null;
            
            return line.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return null;
        }
    }

    private Double parseDouble(String value) {
        if (value == null || value.isEmpty()) return 0.0;
        try {
            return Double.parseDouble(value.replace(",", "").replace("%", ""));
        } catch (Exception e) {
            return 0.0;
        }
    }

    /**
     * Get funds by category
     */
    public List<MutualFundData> getFundsByCategory(String category) {
        return getAllMutualFunds().stream()
            .filter(fund -> category.equalsIgnoreCase(fund.getCategory()))
            .collect(Collectors.toList());
    }

    /**
     * Search funds by name
     */
    public List<MutualFundData> searchFunds(String query) {
        return getAllMutualFunds().stream()
            .filter(fund -> fund.getSchemeName().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
    }

    /**
     * Get top performing funds
     */
    public List<MutualFundData> getTopFunds(int limit) {
        return getAllMutualFunds().stream()
            .sorted((a, b) -> Double.compare(b.getOneYearReturn(), a.getOneYearReturn()))
            .limit(limit)
            .collect(Collectors.toList());
    }
}

