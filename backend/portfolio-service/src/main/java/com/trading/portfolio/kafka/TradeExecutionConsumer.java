package com.trading.portfolio.kafka;

import com.trading.common.events.TradeExecutionEvent;
import com.trading.portfolio.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class TradeExecutionConsumer {

    private final PortfolioService portfolioService;

    @KafkaListener(
            topics = "${spring.kafka.consumer.group-id:trade-executions}",
            groupId = "portfolio-service-group",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeTradeExecution(TradeExecutionEvent execution) {
        log.info("Received trade execution: {} {} {} @ {}", 
                execution.getSide(), execution.getQuantity(), 
                execution.getSymbol(), execution.getExecutionPrice());
        
        try {
            portfolioService.processTradeExecution(execution);
        } catch (Exception e) {
            log.error("Error processing trade execution: {}", e.getMessage(), e);
        }
    }
}

