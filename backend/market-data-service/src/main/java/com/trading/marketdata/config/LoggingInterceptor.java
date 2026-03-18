package com.trading.marketdata.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
public class LoggingInterceptor implements ClientHttpRequestInterceptor {

    @Override
    public ClientHttpResponse intercept(
            HttpRequest request, 
            byte[] body, 
            ClientHttpRequestExecution execution) throws IOException {
        
        logRequest(request, body);
        
        try {
            ClientHttpResponse response = execution.execute(request, body);
            logResponse(response);
            return response;
        } catch (IOException e) {
            log.error("HTTP request failed: {} - {}", request.getURI(), e.getMessage());
            throw e;
        }
    }

    private void logRequest(HttpRequest request, byte[] body) {
        if (log.isDebugEnabled()) {
            log.debug("=== Request ===");
            log.debug("URI: {}", request.getURI());
            log.debug("Method: {}", request.getMethod());
            log.debug("Headers: {}", request.getHeaders());
            log.debug("Request Body: {}", new String(body, StandardCharsets.UTF_8));
            log.debug("================");
        }
    }

    private void logResponse(ClientHttpResponse response) throws IOException {
        if (log.isDebugEnabled()) {
            log.debug("=== Response ===");
            log.debug("Status Code: {}", response.getStatusCode());
            log.debug("Headers: {}", response.getHeaders());
            
            // Read response body for debugging
            String responseBody = StreamUtils.copyToString(response.getBody(), StandardCharsets.UTF_8);
            log.debug("Response Body (first 200 chars): {}", 
                responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody);
            log.debug("==================");
        }
    }
}

