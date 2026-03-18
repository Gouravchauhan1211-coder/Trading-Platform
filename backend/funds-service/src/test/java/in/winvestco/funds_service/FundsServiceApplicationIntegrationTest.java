package com.trading.funds_service;

import com.trading.common.enums.WalletStatus;
import com.trading.funds_service.dto.WalletDTO;
import com.trading.funds_service.model.Wallet;
import com.trading.funds_service.repository.WalletRepository;
import com.trading.funds_service.service.WalletService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class FundsServiceApplicationIntegrationTest {

    @Autowired
    private WalletService walletService;

    @Autowired
    private WalletRepository walletRepository;

    @Test
    void contextLoads() {
        assertNotNull(walletService);
        assertNotNull(walletRepository);
    }

    @Test
    void createWalletForUser_ShouldCreateWalletInDatabase() {
        Long userId = 1L;

        Wallet result = walletService.createWalletForUser(userId);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals(userId, result.getUserId());
        assertEquals("INR", result.getCurrency());
        assertEquals(BigDecimal.ZERO, result.getAvailableBalance());
        assertEquals(WalletStatus.ACTIVE, result.getStatus());
    }

    @Test
    void getWalletByUserId_ShouldReturnWallet() {
        Long userId = 2L;
        walletService.createWalletForUser(userId);

        WalletDTO retrieved = walletService.getWalletByUserId(userId);

        assertNotNull(retrieved);
        assertEquals(userId, retrieved.getUserId());
    }

    @Test
    void hasWallet_AfterCreation_ShouldReturnTrue() {
        Long userId = 3L;
        walletService.createWalletForUser(userId);

        assertTrue(walletService.hasWallet(userId));
    }
}

