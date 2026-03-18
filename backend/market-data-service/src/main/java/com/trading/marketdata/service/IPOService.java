package com.trading.marketdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.marketdata.entity.IPODetails;
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
public class IPOService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Fetch real IPO data from NSE India
     */
    public List<IPODetails> getAllIPOs() {
        log.info("Fetching real-time IPO data from NSE India...");
        List<IPODetails> allIPOs = new ArrayList<>();
        
        try {
            // Fetch from NSE India IPO API
            allIPOs.addAll(fetchFromNSE());
        } catch (Exception e) {
            log.warn("Failed to fetch from NSE: {}", e.getMessage());
        }
        
        try {
            // Fetch from BSE India
            allIPOs.addAll(fetchFromBSE());
        } catch (Exception e) {
            log.warn("Failed to fetch from BSE: {}", e.getMessage());
        }
        
        if (allIPOs.isEmpty()) {
            log.warn("No IPO data available from external sources");
        } else {
            log.info("Successfully fetched {} IPO records", allIPOs.size());
        }
        
        return allIPOs;
    }

    /**
     * Fetch IPOs from NSE India
     */
    private List<IPODetails> fetchFromNSE() {
        List<IPODetails> ipos = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json");
            headers.set("Referer", "https://www.nseindia.com/");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // NSE India IPO API endpoint
            String url = "https://www.nseindia.com/api/ipo-details";
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                if (root.isArray()) {
                    for (JsonNode ipoNode : root) {
                        try {
                            IPODetails ipo = parseNSEIPO(ipoNode);
                            if (ipo != null) {
                                ipos.add(ipo);
                            }
                        } catch (Exception e) {
                            log.debug("Failed to parse IPO entry: {}", e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("NSE IPO fetch failed: {}", e.getMessage());
        }
        
        return ipos;
    }

    /**
     * Parse NSE IPO response
     */
    private IPODetails parseNSEIPO(JsonNode node) {
        String symbol = node.path("symbol").asText("");
        if (symbol.isEmpty()) {
            symbol = node.path("companyName").asText("");
        }
        
        if (symbol.isEmpty()) {
            return null;
        }
        
        String priceBand = "₹" + node.path("price").asText("0");
        
        int lotSize = node.path("lotSize").asInt(1);
        
        LocalDate openDate = parseDate(node.path("openDate").asText(""));
        LocalDate closeDate = parseDate(node.path("closeDate").asText(""));
        
        String status = determineStatus(openDate, closeDate);
        
        long issueSize = node.path("issueSize").asLong(0);
        
        return IPODetails.builder()
            .id(node.path("id").asText(symbol))
            .name(node.path("companyName").asText(symbol))
            .priceBand(priceBand)
            .lotSize(lotSize)
            .openDate(openDate)
            .closeDate(closeDate)
            .status(status)
            .exchange("NSE")
            .issueSize(issueSize)
            .description(node.path("companyName").asText(""))
            .build();
    }

    /**
     * Fetch IPOs from BSE India
     */
    private List<IPODetails> fetchFromBSE() {
        List<IPODetails> ipos = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // BSE India IPO API
            String url = "https://api.bseindia.com/BseIndiaAPI/api/ListofIPO/w?group=&Scripcode=&industry=&segment=Main";
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                
                if (root.isArray()) {
                    for (JsonNode ipoNode : root) {
                        try {
                            IPODetails ipo = parseBSEIPO(ipoNode);
                            if (ipo != null) {
                                ipos.add(ipo);
                            }
                        } catch (Exception e) {
                            log.debug("Failed to parse BSE IPO: {}", e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("BSE IPO fetch failed: {}", e.getMessage());
        }
        
        return ipos;
    }

    /**
     * Parse BSE IPO response
     */
    private IPODetails parseBSEIPO(JsonNode node) {
        String companyName = node.path("companyName").asText("");
        
        if (companyName.isEmpty()) {
            return null;
        }
        
        String priceBand = "₹" + node.path("price").asText("0");
        
        LocalDate openDate = parseDate(node.path("openDate").asText(""));
        LocalDate closeDate = parseDate(node.path("closeDate").asText(""));
        
        String status = determineStatus(openDate, closeDate);
        
        return IPODetails.builder()
            .id(node.path("scripCode").asText(companyName))
            .name(companyName)
            .priceBand(priceBand)
            .lotSize(node.path("lotSize").asInt(1))
            .openDate(openDate)
            .closeDate(closeDate)
            .status(status)
            .exchange("BSE")
            .issueSize(0)
            .description(companyName)
            .build();
    }

    /**
     * Parse date string to LocalDate
     */
    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        
        try {
            // Try different date formats
            if (dateStr.contains("/")) {
                String[] parts = dateStr.split("/");
                if (parts.length == 3) {
                    return LocalDate.of(
                        Integer.parseInt(parts[2]),
                        Integer.parseInt(parts[1]),
                        Integer.parseInt(parts[0])
                    );
                }
            }
            return LocalDate.parse(dateStr);
        } catch (Exception e) {
            log.debug("Failed to parse date: {}", dateStr);
            return null;
        }
    }

    /**
     * Determine IPO status based on dates
     */
    private String determineStatus(LocalDate openDate, LocalDate closeDate) {
        LocalDate today = LocalDate.now();
        
        if (openDate == null && closeDate == null) {
            return "Upcoming";
        }
        
        if (openDate != null && today.isBefore(openDate)) {
            return "Upcoming";
        }
        
        if (closeDate != null && today.isAfter(closeDate)) {
            return "Closed";
        }
        
        if (openDate != null && closeDate != null && 
            !today.isBefore(openDate) && !today.isAfter(closeDate)) {
            return "Open";
        }
        
        return "Upcoming";
    }

    /**
     * Get only open IPOs
     */
    public List<IPODetails> getOpenIPOs() {
        return getAllIPOs().stream()
            .filter(ipo -> "Open".equals(ipo.getStatus()))
            .collect(Collectors.toList());
    }

    /**
     * Get upcoming IPOs
     */
    public List<IPODetails> getUpcomingIPOs() {
        return getAllIPOs().stream()
            .filter(ipo -> "Upcoming".equals(ipo.getStatus()))
            .collect(Collectors.toList());
    }
}

