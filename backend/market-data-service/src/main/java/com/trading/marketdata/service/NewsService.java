package com.trading.marketdata.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trading.marketdata.entity.NewsArticle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class NewsService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // Alternative news sources (can be configured)
    @Value("${app.news.api.enabled:true}")
    private boolean newsApiEnabled;

    private static final String YAHOO_FINANCE_NEWS_URL = "https://newsapi.org/v2/top-headlines";
    private static final String MONEYCONTROL_URL = "https://www.moneycontrol.com/rss/";
    
    /**
     * Fetch real-time market news from external APIs
     */
    public List<NewsArticle> getAllNews() {
        log.info("Fetching real-time market news...");
        List<NewsArticle> allNews = new ArrayList<>();
        
        // Try fetching from multiple sources
        try {
            allNews.addAll(fetchFromMoneycontrol());
        } catch (Exception e) {
            log.warn("Failed to fetch from Moneycontrol: {}", e.getMessage());
        }
        
        try {
            allNews.addAll(fetchFromNSELive());
        } catch (Exception e) {
            log.warn("Failed to fetch from NSE Live: {}", e.getMessage());
        }
        
        // If no data from external APIs, return empty list
        if (allNews.isEmpty()) {
            log.warn("No news data available from external sources");
        } else {
            log.info("Successfully fetched {} news articles", allNews.size());
        }
        
        return allNews;
    }

    /**
     * Fetch news from Moneycontrol RSS feeds
     */
    private List<NewsArticle> fetchFromMoneycontrol() {
        List<NewsArticle> newsList = new ArrayList<>();
        
        try {
            // Moneycontrol RSS feeds for different categories
            String[] rssFeeds = {
                "https://www.moneycontrol.com/rss/marketreports.xml",
                "https://www.moneycontrol.com/rss/stocknews.xml"
            };
            
            for (int i = 0; i < rssFeeds.length; i++) {
                try {
                    HttpHeaders headers = new HttpHeaders();
                    headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
                    headers.set("Accept", "application/rss+xml, application/xml, text/xml");
                    
                    HttpEntity<String> entity = new HttpEntity<>(headers);
                    ResponseEntity<String> response = restTemplate.exchange(
                        rssFeeds[i],
                        HttpMethod.GET,
                        entity,
                        String.class
                    );
                    
                    if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                        // Parse RSS/Atom feed (simplified)
                        String xml = response.getBody();
                        newsList.addAll(parseRSSFeed(xml, "Market"));
                    }
                } catch (Exception e) {
                    log.debug("RSS feed {} failed: {}", i, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Moneycontrol fetch failed: {}", e.getMessage());
        }
        
        return newsList;
    }

    /**
     * Fetch news from NSE India live market data
     */
    private List<NewsArticle> fetchFromNSELive() {
        List<NewsArticle> newsList = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json");
            headers.set("Referer", "https://www.nseindia.com/");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // NSE India Corporate Actions API
            String url = "https://www.nseindia.com/api/corporate-filings";
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                // Parse corporate announcements
                if (root.isArray()) {
                    for (JsonNode node : root) {
                        NewsArticle article = NewsArticle.builder()
                            .id(node.path("id").asText())
                            .title(node.path("subject").asText(""))
                            .description(node.path("desc").asText(""))
                            .tag("Corporate")
                            .tagColor("#5b8af7")
                            .source("NSE India")
                            .publishedAt(LocalDateTime.now())
                            .build();
                        newsList.add(article);
                    }
                }
            }
        } catch (Exception e) {
            log.debug("NSE corporate fetch failed: {}", e.getMessage());
        }
        
        return newsList;
    }

    /**
     * Parse RSS feed into NewsArticle list
     */
    private List<NewsArticle> parseRSSFeed(String xml, String category) {
        List<NewsArticle> articles = new ArrayList<>();
        
        try {
            // Simple XML parsing - extract item titles
            String[] items = xml.split("<item>");
            int id = 1;
            
            for (String item : items) {
                if (item.contains("<title>") && item.contains("</title>")) {
                    int start = item.indexOf("<title>") + 7;
                    int end = item.indexOf("</title>");
                    String title = item.substring(start, end).trim();
                    
                    if (title.length() > 10 && !title.contains("<")) {
                        NewsArticle article = NewsArticle.builder()
                            .id(String.valueOf(id++))
                            .title(title)
                            .tag(category)
                            .tagColor(getCategoryColor(category))
                            .source("Moneycontrol")
                            .publishedAt(LocalDateTime.now().minusHours(id))
                            .build();
                        articles.add(article);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("RSS parsing failed: {}", e.getMessage());
        }
        
        return articles;
    }

    /**
     * Get news by category
     */
    public List<NewsArticle> getNewsByCategory(String category) {
        List<NewsArticle> allNews = getAllNews();
        
        if (category == null || category.isEmpty()) {
            return allNews;
        }
        
        return allNews.stream()
            .filter(news -> news.getTag().equalsIgnoreCase(category))
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get news by symbol
     */
    public List<NewsArticle> getNewsBySymbol(String symbol) {
        // For symbol-specific news, we would need a more sophisticated API
        // This is a placeholder - could be connected to a stock-specific news API
        List<NewsArticle> allNews = getAllNews();
        
        return allNews.stream()
            .filter(news -> symbol.equalsIgnoreCase(news.getSymbol()))
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get trending stocks based on market activity
     */
    public List<NewsArticle> getTrendingStocks() {
        // Return top gaining/losing stocks as trending
        // In production, this would analyze news sentiment
        List<NewsArticle> trending = new ArrayList<>();
        
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");
            headers.set("Referer", "https://www.nseindia.com/");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Get top gainers
            String gainersUrl = "https://www.nseindia.com/api/market-data-pre-open?index=nifty50";
            ResponseEntity<String> response = restTemplate.exchange(
                gainersUrl, HttpMethod.GET, entity, String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode data = root.path("data");
                
                if (data.isArray()) {
                    int count = 0;
                    for (JsonNode stock : data) {
                        if (count++ >= 5) break;
                        
                        String symbol = stock.path("symbol").asText();
                        double price = stock.path("lastPrice").asDouble();
                        double change = stock.path("pChange").asDouble();
                        
                        NewsArticle article = NewsArticle.builder()
                            .id(String.valueOf(count))
                            .title(String.format("%s: %.2f%% change at ₹%.2f", symbol, change, price))
                            .tag("Trending")
                            .tagColor(change >= 0 ? "#00d084" : "#ff4d6a")
                            .source("NSE India")
                            .symbol(symbol)
                            .publishedAt(LocalDateTime.now())
                            .build();
                        trending.add(article);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch trending stocks: {}", e.getMessage());
        }
        
        return trending;
    }

    private String getCategoryColor(String category) {
        switch (category.toLowerCase()) {
            case "markets": return "#5b8af7";
            case "economy": return "#00d084";
            case "company": return "#f5a623";
            case "global": return "#a855f7";
            default: return "#64748b";
        }
    }
}

