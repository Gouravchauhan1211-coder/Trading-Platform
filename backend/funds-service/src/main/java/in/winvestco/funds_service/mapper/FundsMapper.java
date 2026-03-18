package com.trading.funds_service.mapper;

import com.trading.funds_service.dto.FundsLockDTO;
import com.trading.funds_service.dto.TransactionDTO;
import com.trading.funds_service.dto.WalletDTO;
import com.trading.funds_service.model.FundsLock;
import com.trading.funds_service.model.Transaction;
import com.trading.funds_service.model.Wallet;
import org.mapstruct.Mapper;
import java.util.List;


/**
 * MapStruct mapper for funds service entities and DTOs.
 * Note: LedgerEntry mappings are now in ledger-service.
 */
@Mapper(componentModel = "spring")
public interface FundsMapper {

    // Wallet mappings
    WalletDTO toWalletDTO(Wallet wallet);

    List<WalletDTO> toWalletDTOList(List<Wallet> wallets);

    // FundsLock mappings
    FundsLockDTO toFundsLockDTO(FundsLock fundsLock);

    List<FundsLockDTO> toFundsLockDTOList(List<FundsLock> fundsLocks);

    // Transaction mappings
    TransactionDTO toTransactionDTO(Transaction transaction);

    List<TransactionDTO> toTransactionDTOList(List<Transaction> transactions);
}

