package com.trading.marketdata.service;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIAnalysisService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.provider:openai}")
    private String provider;

    @Value("${ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${ai.openai.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;

    @Value("${ai.perplexity.api-key:}")
    private String perplexityApiKey;

    @Value("${ai.perplexity.base-url:https://api.perplexity.ai}")
    private String perplexityBaseUrl;

    @Value("${ai.grok.api-key:}")
    private String grokApiKey;

    @Value("${ai.grok.base-url:https://api.x.ai/v1}")
    private String grokBaseUrl;

    @Data
    public static class AIAnalysisRequest {
        private String symbol;
        private Double price;
        private Double changePercent;
        private Long volume;
        private String sector;
    }

    @Data
    public static class AIAnalysisResponse {
        private String recommendation; // BUY, SELL, HOLD
        private String timeframe;
        private String summary;
        private List<String> pros;
        private List<String> cons;
        private String sentiment;
        private String rawResponse;
    }

    public Mono<AIAnalysisResponse> analyzeStock(AIAnalysisRequest request) {
        String apiKey;
        String baseUrl;
        String model;

        switch (provider.toLowerCase()) {
            case "perplexity":
                apiKey = perplexityApiKey;
                baseUrl = perplexityBaseUrl;
                model = "llama-3.1-sonar-small-128k-online";
                break;
            case "grok":
                apiKey = grokApiKey;
                baseUrl = grokBaseUrl;
                model = "grok-beta";
                break;
            default:
                apiKey = openaiApiKey;
                baseUrl = openaiBaseUrl;
                model = "gpt-4o-mini";
                break;
        }

        if (apiKey == null || apiKey.isEmpty()) {
            return Mono.error(new RuntimeException("API Key for " + provider + " is not configured"));
        }

        String prompt = String.format(
            "Analyze stock %s. Data: Price ₹%.2f, Change %.2f%%, Volume %d, Sector: %s. " +
            "Provide a recommendation (BUY, SELL, HOLD), target timeframe, and summary for a beginner trader. " +
            "Format response as JSON with fields: recommendation, timeframe, summary, pros (list), cons (list), sentiment.",
            request.getSymbol(), request.getPrice(), request.getChangePercent(), request.getVolume(), request.getSector()
        );

        return webClientBuilder.baseUrl(baseUrl).build()
            .post()
            .uri("/chat/completions")
            .header("Authorization", "Bearer " + apiKey)
            .bodyValue(Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", "You are a professional stock market analyst for beginners."),
                    Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object")
            ))
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                try {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    
                    // In a real app, use Jackson to parse 'content' into AIAnalysisResponse
                    // For now, returning raw content in the summary field for demo
                    AIAnalysisResponse analysis = new AIAnalysisResponse();
                    analysis.setRawResponse(content);
                    analysis.setSummary(content); // Basic mapping for now
                    return analysis;
                } catch (Exception e) {
                    log.error("Failed to parse AI response", e);
                    throw new RuntimeException("AI Analysis failed");
                }
            });
    public Mono<Map<String, String>> analyzeNewsSentiment(String headline, String summary) {
        String apiKey;
        String baseUrl;
        String model;

        switch (provider.toLowerCase()) {
            case "perplexity":
                apiKey = perplexityApiKey;
                baseUrl = perplexityBaseUrl;
                model = "llama-3.1-sonar-small-128k-online";
                break;
            case "grok":
                apiKey = grokApiKey;
                baseUrl = grokBaseUrl;
                model = "grok-beta";
                break;
            default:
                apiKey = openaiApiKey;
                baseUrl = openaiBaseUrl;
                model = "gpt-4o-mini";
                break;
        }

        if (apiKey == null || apiKey.isEmpty()) {
            return Mono.error(new RuntimeException("API Key for " + provider + " is not configured"));
        }

        String prompt = String.format(
            "Analyze the sentiment of this news for a stock trader. " +
            "Headline: %s. Summary: %s. " +
            "Respond with ONLY a JSON object: {\"sentiment\": \"BULLISH\" | \"BEARISH\" | \"NEUTRAL\", \"score\": 0.0 to 1.0, \"reason\": \"short reason\"}",
            headline, summary
        );

        return webClientBuilder.baseUrl(baseUrl).build()
            .post()
            .uri("/chat/completions")
            .header("Authorization", "Bearer " + apiKey)
            .bodyValue(Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", "You are a financial sentiment analyzer."),
                    Map.of("role", "user", "content", prompt)
                ),
                "response_format", Map.of("type", "json_object")
            ))
            .retrieve()
            .bodyToMono(Map.class)
            .map(response -> {
                try {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String jsonContent = (String) message.get("content");
                    
                    // Basic parsing (in production use Jackson)
                    return Map.of("content", jsonContent);
                } catch (Exception e) {
                    log.error("Failed to parse Sentiment response", e);
                    return Map.of("sentiment", "NEUTRAL", "reason", "Error parsing AI response");
                }
            });
    }
}
