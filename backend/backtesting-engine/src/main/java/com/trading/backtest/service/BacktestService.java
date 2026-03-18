package com.trading.backtest.service;

import com.trading.backtest.model.BacktestResult;
import com.trading.backtest.model.BacktestTrade;
import com.trading.backtest.model.EquityCurvePoint;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class BacktestService {

    @Value("${app.backtest.default-slippage:0.001}")
    private BigDecimal defaultSlippage;

    @Value("${app.backtest.default-brokerage:0.001}")
    private BigDecimal defaultBrokerage;

    @Value("${app.backtest.initial-capital:100000}")
    private BigDecimal initialCapital;

    public BacktestResult runBacktest(String symbol, String strategyType, Instant startDate, Instant endDate,
                                      BigDecimal quantity, BigDecimal stopLoss, BigDecimal takeProfit) {
        log.info("Starting backtest for {} from {} to {}", symbol, startDate, endDate);

        BigDecimal capital = initialCapital;
        BigDecimal currentPosition = BigDecimal.ZERO;
        BigDecimal entryPrice = BigDecimal.ZERO;
        Instant entryTime = null;

        List<BacktestTrade> trades = new ArrayList<>();
        List<EquityCurvePoint> equityCurve = new ArrayList<>();
        int tradeNumber = 0;
        int winningTrades = 0;
        int losingTrades = 0;
        BigDecimal totalProfit = BigDecimal.ZERO;
        BigDecimal totalLoss = BigDecimal.ZERO;

        // Simulate price data (in production, fetch from database)
        List<BigDecimal> priceHistory = generateSamplePrices(symbol, startDate, endDate);
        BigDecimal peakEquity = initialCapital;
        BigDecimal maxDrawdown = BigDecimal.ZERO;

        for (int i = 0; i < priceHistory.size(); i++) {
            BigDecimal currentPrice = priceHistory.get(i);
            Instant currentTime = startDate.plusSeconds(i * 300); // 5-minute candles

            // Generate signal based on strategy
            String signal = generateSignal(priceHistory, i, strategyType);

            // Execute trades
            if ("BUY".equals(signal) && currentPosition.compareTo(BigDecimal.ZERO) == 0) {
                // Buy signal - enter position
                BigDecimal slippage = currentPrice.multiply(defaultSlippage);
                entryPrice = currentPrice.add(slippage);
                entryTime = currentTime;
                currentPosition = quantity;
                capital = capital.subtract(entryPrice.multiply(quantity));
            } else if ("SELL".equals(signal) && currentPosition.compareTo(BigDecimal.ZERO) > 0) {
                // Sell signal - exit position
                BigDecimal slippage = currentPrice.multiply(defaultSlippage);
                BigDecimal exitPrice = currentPrice.subtract(slippage);
                BigDecimal pnl = exitPrice.subtract(entryPrice).multiply(currentPosition);
                BigDecimal tradeBrokerage = entryPrice.add(exitPrice).multiply(currentPosition).multiply(defaultBrokerage);
                BigDecimal netPnl = pnl.subtract(tradeBrokerage);

                // Check stop loss / take profit
                BigDecimal pnlPercent = netPnl.divide(entryPrice.multiply(currentPosition), 4, RoundingMode.HALF_UP);

                if (stopLoss != null && pnlPercent.compareTo(stopLoss.negate()) < 0) {
                    // Stop loss triggered
                    netPnl = entryPrice.multiply(currentPosition).multiply(stopLoss).negate();
                } else if (takeProfit != null && pnlPercent.compareTo(takeProfit) > 0) {
                    // Take profit triggered
                }

                capital = capital.add(exitPrice.multiply(currentPosition));
                tradeNumber++;

                BacktestTrade trade = BacktestTrade.builder()
                        .tradeNumber(tradeNumber)
                        .symbol(symbol)
                        .side("BUY")
                        .entryPrice(entryPrice)
                        .exitPrice(exitPrice)
                        .quantity(currentPosition)
                        .pnl(pnl)
                        .brokerage(tradeBrokerage)
                        .netPnl(netPnl)
                        .entryTime(entryTime)
                        .exitTime(currentTime)
                        .holdingPeriod((int) (currentTime.toEpochMilli() - entryTime.toEpochMilli()) / 1000)
                        .build();
                trades.add(trade);

                if (netPnl.compareTo(BigDecimal.ZERO) > 0) {
                    winningTrades++;
                    totalProfit = totalProfit.add(netPnl);
                } else {
                    losingTrades++;
                    totalLoss = totalLoss.add(netPnl);
                }

                currentPosition = BigDecimal.ZERO;
                entryPrice = BigDecimal.ZERO;
            }

            // Update equity curve
            BigDecimal currentEquity = capital.add(currentPosition.multiply(currentPrice));
            equityCurve.add(EquityCurvePoint.builder()
                    .timestamp(currentTime)
                    .equity(currentEquity)
                    .drawdown(currentEquity.subtract(peakEquity).divide(peakEquity, 4, RoundingMode.HALF_UP))
                    .build());

            // Track max drawdown
            if (currentEquity.compareTo(peakEquity) > 0) {
                peakEquity = currentEquity;
            }
            BigDecimal currentDrawdown = peakEquity.subtract(currentEquity).divide(peakEquity, 4, RoundingMode.HALF_UP);
            if (currentDrawdown.compareTo(maxDrawdown) > 0) {
                maxDrawdown = currentDrawdown;
            }
        }

        // Calculate metrics
        BigDecimal finalCapital = capital;
        BigDecimal totalReturn = finalCapital.subtract(initialCapital).divide(initialCapital, 4, RoundingMode.HALF_UP);
        BigDecimal winRate = winningTrades > 0 ? BigDecimal.valueOf(winningTrades).divide(
                BigDecimal.valueOf(tradeNumber), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal profitFactor = totalLoss.abs().compareTo(BigDecimal.ZERO) > 0 ?
                totalProfit.divide(totalLoss.abs(), 4, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        // Calculate Sharpe Ratio (simplified)
        BigDecimal sharpeRatio = calculateSharpeRatio(equityCurve);

        return BacktestResult.builder()
                .id(UUID.randomUUID())
                .strategyId(UUID.randomUUID())
                .symbol(symbol)
                .startDate(startDate)
                .endDate(endDate)
                .initialCapital(initialCapital)
                .finalCapital(finalCapital)
                .totalReturn(totalReturn.multiply(BigDecimal.valueOf(100)))
                .sharpeRatio(sharpeRatio)
                .maxDrawdown(maxDrawdown.multiply(BigDecimal.valueOf(100)))
                .winRate(winRate.multiply(BigDecimal.valueOf(100)))
                .profitFactor(profitFactor)
                .totalTrades(tradeNumber)
                .winningTrades(winningTrades)
                .losingTrades(losingTrades)
                .trades(trades)
                .equityCurve(equityCurve)
                .completedAt(Instant.now())
                .build();
    }

    private String generateSignal(List<BigDecimal> prices, int currentIndex, String strategyType) {
        if (currentIndex < 50) return null;

        if ("MOVING_AVERAGE_CROSSOVER".equals(strategyType)) {
            BigDecimal ma20 = calculateMA(prices, currentIndex - 20, currentIndex);
            BigDecimal ma50 = calculateMA(prices, currentIndex - 50, currentIndex);
            BigDecimal prevMa20 = calculateMA(prices, currentIndex - 21, currentIndex - 1);
            BigDecimal prevMa50 = calculateMA(prices, currentIndex - 51, currentIndex - 1);

            if (prevMa20.compareTo(prevMa50) <= 0 && ma20.compareTo(ma50) > 0) {
                return "BUY";
            } else if (prevMa20.compareTo(prevMa50) >= 0 && ma20.compareTo(ma50) < 0) {
                return "SELL";
            }
        } else if ("RSI".equals(strategyType)) {
            BigDecimal rsi = calculateRSI(prices, currentIndex);
            if (rsi.compareTo(BigDecimal.valueOf(30)) < 0) {
                return "BUY";
            } else if (rsi.compareTo(BigDecimal.valueOf(70)) > 0) {
                return "SELL";
            }
        }
        return null;
    }

    private BigDecimal calculateMA(List<BigDecimal> prices, int start, int end) {
        if (start < 0 || end >= prices.size()) return BigDecimal.ZERO;
        BigDecimal sum = BigDecimal.ZERO;
        for (int i = start; i < end; i++) {
            sum = sum.add(prices.get(i));
        }
        return sum.divide(BigDecimal.valueOf(end - start), 4, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateRSI(List<BigDecimal> prices, int currentIndex) {
        if (currentIndex < 14) return BigDecimal.valueOf(50);

        BigDecimal gains = BigDecimal.ZERO;
        BigDecimal losses = BigDecimal.ZERO;

        for (int i = currentIndex - 13; i <= currentIndex; i++) {
            if (i == 0) continue;
            BigDecimal change = prices.get(i).subtract(prices.get(i - 1));
            if (change.compareTo(BigDecimal.ZERO) > 0) {
                gains = gains.add(change);
            } else {
                losses = losses.add(change.abs());
            }
        }

        BigDecimal avgGain = gains.divide(BigDecimal.valueOf(14), 4, RoundingMode.HALF_UP);
        BigDecimal avgLoss = losses.divide(BigDecimal.valueOf(14), 4, RoundingMode.HALF_UP);

        if (avgLoss.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.valueOf(100);
        }

        BigDecimal rs = avgGain.divide(avgLoss, 4, RoundingMode.HALF_UP);
        return BigDecimal.valueOf(100).subtract(BigDecimal.valueOf(100).divide(rs.add(BigDecimal.ONE), 4, RoundingMode.HALF_UP));
    }

    private BigDecimal calculateSharpeRatio(List<EquityCurvePoint> equityCurve) {
        if (equityCurve.size() < 2) return BigDecimal.ZERO;

        List<BigDecimal> returns = new ArrayList<>();
        for (int i = 1; i < equityCurve.size(); i++) {
            BigDecimal ret = equityCurve.get(i).getEquity()
                    .subtract(equityCurve.get(i - 1).getEquity())
                    .divide(equityCurve.get(i - 1).getEquity(), 6, RoundingMode.HALF_UP);
            returns.add(ret);
        }

        if (returns.isEmpty()) return BigDecimal.ZERO;

        BigDecimal avgReturn = returns.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(returns.size()), 4, RoundingMode.HALF_UP);

        BigDecimal variance = BigDecimal.ZERO;
        for (BigDecimal ret : returns) {
            variance = variance.add(ret.subtract(avgReturn).pow(2));
        }
        variance = variance.divide(BigDecimal.valueOf(returns.size()), 4, RoundingMode.HALF_UP);
        BigDecimal stdDev = BigDecimal.valueOf(Math.sqrt(variance.doubleValue()));

        if (stdDev.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;

        // Annualized Sharpe Ratio (assuming 252 trading days)
        return avgReturn.multiply(BigDecimal.valueOf(Math.sqrt(252)))
                .divide(stdDev, 4, RoundingMode.HALF_UP);
    }

    private List<BigDecimal> generateSamplePrices(String symbol, Instant startDate, Instant endDate) {
        // Generate sample prices for simulation
        List<BigDecimal> prices = new ArrayList<>();
        long duration = endDate.toEpochMilli() - startDate.toEpochMilli();
        int numCandles = (int) (duration / (300 * 1000)); // 5-minute candles

        BigDecimal basePrice = getBasePrice(symbol);

        for (int i = 0; i < numCandles; i++) {
            // Random walk with drift
            double change = (Math.random() - 0.5) * 0.02;
            basePrice = basePrice.multiply(BigDecimal.valueOf(1 + change));
            prices.add(basePrice);
        }
        return prices;
    }

    private BigDecimal getBasePrice(String symbol) {
        switch (symbol) {
            case "RELIANCE": return BigDecimal.valueOf(2400);
            case "TCS": return BigDecimal.valueOf(3800);
            case "INFY": return BigDecimal.valueOf(1500);
            case "AAPL": return BigDecimal.valueOf(175);
            case "GOOGL": return BigDecimal.valueOf(140);
            default: return BigDecimal.valueOf(100);
        }
    }
}

