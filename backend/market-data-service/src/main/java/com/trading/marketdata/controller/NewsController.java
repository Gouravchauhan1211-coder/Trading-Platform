package com.trading.marketdata.controller;

import com.trading.marketdata.entity.NewsArticle;
import com.trading.marketdata.service.NewsService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    @CircuitBreaker(name = "newsService", fallbackMethod = "getAllNewsFallback")
    @RateLimiter(name = "newsService")
    public ResponseEntity<List<NewsArticle>> getAllNews(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String symbol) {
        
        log.info("Received request to fetch news - category: {}, symbol: {}", category, symbol);
        
        List<NewsArticle> news;
        
        if (symbol != null && !symbol.isEmpty()) {
            news = newsService.getNewsBySymbol(symbol);
        } else if (category != null && !category.isEmpty()) {
            news = newsService.getNewsByCategory(category);
        } else {
            news = newsService.getAllNews();
        }
        
        log.info("Returning {} news articles", news.size());
        return ResponseEntity.ok(news);
    }
    
    public ResponseEntity<List<NewsArticle>> getAllNewsFallback(String category, String symbol, Exception ex) {
        log.warn("Circuit breaker activated for getAllNews. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }

    @GetMapping("/trending")
    @CircuitBreaker(name = "newsService", fallbackMethod = "getTrendingFallback")
    public ResponseEntity<List<NewsArticle>> getTrending() {
        log.info("Received request to fetch trending stocks");
        List<NewsArticle> trending = newsService.getTrendingStocks();
        log.info("Returning {} trending stocks", trending.size());
        return ResponseEntity.ok(trending);
    }
    
    public ResponseEntity<List<NewsArticle>> getTrendingFallback(Exception ex) {
        log.warn("Circuit breaker activated for getTrending. Error: {}", ex.getMessage());
        return ResponseEntity.ok(Collections.emptyList());
    }
}

