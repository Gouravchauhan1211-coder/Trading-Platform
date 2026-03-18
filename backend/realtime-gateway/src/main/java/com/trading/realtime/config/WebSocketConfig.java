package com.trading.realtime.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.websocket.path}")
    private String websocketPath;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for /topic destinations
        config.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages from clients
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket endpoint with SockJS support
        registry.addEndpoint(websocketPath)
                .setAllowedOriginPatterns("*")
                .withSockJS();
        
        // Plain WebSocket endpoint (no SockJS)
        registry.addEndpoint(websocketPath)
                .setAllowedOriginPatterns("*");
    }
}

