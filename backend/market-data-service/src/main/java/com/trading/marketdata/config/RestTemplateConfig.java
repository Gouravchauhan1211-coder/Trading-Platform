package com.trading.marketdata.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.BufferingClientHttpRequestFactory;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableScheduling
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        // Use RestTemplateBuilder which automatically configures gzip decompression
        RestTemplate restTemplate = builder
            .setConnectTimeout(Duration.ofSeconds(30))
            .setReadTimeout(Duration.ofSeconds(30))
            .build();
        
        // Enable request/response logging for debugging
        BufferingClientHttpRequestFactory factory = new BufferingClientHttpRequestFactory(
            restTemplate.getRequestFactory()
        );
        restTemplate.setRequestFactory(factory);
        
        // Add string converter with proper encoding
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        
        // Add interceptors for logging and gzip decompression
        List<ClientHttpRequestInterceptor> interceptors = new ArrayList<>();
        interceptors.add(new GzipDecompressionInterceptor());
        interceptors.add(new LoggingInterceptor());
        restTemplate.setInterceptors(interceptors);
        
        return restTemplate;
    }
}

