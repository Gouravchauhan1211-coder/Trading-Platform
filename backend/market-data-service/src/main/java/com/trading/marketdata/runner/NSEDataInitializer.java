package com.trading.marketdata.runner;

import com.trading.marketdata.service.NSEScraperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NSEDataInitializer implements ApplicationRunner {

    private final NSEScraperService nseScraperService;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Initializing NSE stock data...");
        try {
            nseScraperService.initialLoad();
        } catch (Exception e) {
            log.error("Failed to initialize NSE stock data: {}", e.getMessage());
        }
    }
}

