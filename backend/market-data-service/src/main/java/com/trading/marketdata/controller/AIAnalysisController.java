package com.trading.marketdata.controller;

import com.trading.marketdata.service.AIAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    @PostMapping("/analyze")
    public Mono<AIAnalysisService.AIAnalysisResponse> analyzeStock(@RequestBody AIAnalysisService.AIAnalysisRequest request) {
        log.info("Received AI analysis request for symbol: {}", request.getSymbol());
        return aiAnalysisService.analyzeStock(request);
    }

    @PostMapping("/sentiment")
    public Mono<java.util.Map<String, String>> analyzeSentiment(@RequestBody java.util.Map<String, String> request) {
        String headline = request.get("headline");
        String summary = request.get("summary");
        log.info("Received AI sentiment request for headline: {}", headline);
        return aiAnalysisService.analyzeNewsSentiment(headline, summary);
    }
}
