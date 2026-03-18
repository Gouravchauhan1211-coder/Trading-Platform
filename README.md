# Trading Platform

A high-performance algorithmic trading platform built with Spring Boot microservices architecture for Indian stock markets (NSE/BSE).

## Project Overview

This is the **MAIN** trading platform project with enhanced features for algorithmic trading. The platform provides real-time market data, automated trading strategies, portfolio management, risk management, and comprehensive reporting.

## Architecture

### Microservices (16 Services)

| Service | Port | Description | API Base Path |
|---------|------|-------------|---------------|
| user-service | 8081 | User authentication and management | `/api/users` |
| market-data-service | 8082 | Market data, news, ETFs, IPOs, commodities | `/api/market-data`, `/api/news`, `/api/etf`, `/api/ipo`, `/api/commodities`, `/api/mutual-funds` |
| strategy-engine | 8083 | Trading strategy execution | `/api/strategies` |
| order-service | 8084 | Order management and execution | `/api/orders` |
| portfolio-service | 8085 | Portfolio tracking and management | `/api/portfolio` |
| risk-service | 8086 | Risk management and validation | `/api/risk` |
| realtime-gateway | 8088 | WebSocket gateway for real-time updates | WebSocket |
| backtesting-engine | 8087 | Backtesting trading strategies | `/api/backtest` |
| funds-service | 8093 | Funds and wallet management | `/api/v1/funds` |
| payment-service | 8094 | Payment processing (Razorpay) | `/api/v1/payments` |
| trade-service | 8095 | Trade execution and validation | `/api/v1/trades` |
| notification-service | 8091 | Multi-channel notifications | `/api/v1/notifications` |
| report-service | 8092 | Report generation | `/api/v1/reports` |
| eureka-server | 8761 | Service registry |
| api-gateway | 8090 | Spring Cloud Gateway |
| kong | 8000 | API Gateway (Kong) |

### Infrastructure

| Component | Port | Description |
|-----------|------|-------------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Caching layer |
| Kafka | 9092 | Message broker |
| Zookeeper | 2181 | Kafka coordination |
| Kong Gateway | 8000 | API Gateway |
| Kafka UI | 8080 | Kafka management UI |
| Mock Broker | 8090 | Testing broker API |

## Technology Stack

- **Framework:** Spring Boot 3.2.0
- **Cloud:** Spring Cloud 2023.0.0
- **Database:** PostgreSQL 15, Redis 7
- **Messaging:** Apache Kafka 7.5.0
- **API Gateway:** Kong 3.3
- **Build:** Maven 3.8+
- **Java:** 17
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS

## Project Structure

```
Trading-Platform-main/
├── backend/
│   ├── common/                 # Shared libraries and events
│   ├── user-service/           # User authentication
│   ├── market-data-service/    # Market data (NSE/BSE)
│   ├── strategy-engine/        # Strategy execution
│   ├── order-service/          # Order management
│   ├── portfolio-service/      # Portfolio tracking
│   ├── risk-service/           # Risk validation
│   ├── funds-service/          # Funds & wallet
│   ├── payment-service/        # Payment processing
│   ├── trade-service/          # Trade execution
│   ├── notification-service/   # Notifications
│   ├── report-service/         # Report generation
│   ├── realtime-gateway/       # WebSocket gateway
│   ├── backtesting-engine/     # Backtesting
│   ├── api-gateway/            # Spring Cloud Gateway
│   └── eureka-server/          # Service registry
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── services/           # API services
│   │   ├── components/         # UI components
│   │   ├── store/              # State management
│   │   └── types/              # TypeScript types
├── gateway/                   # Kong gateway config
├── database/                  # Database migrations
├── docker-compose.yml          # Container orchestration
└── README.md
```

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- Docker & Docker Compose
- Node.js 18+ (for frontend)
- PostgreSQL 15+ (optional, can use Docker)
- Redis 7+ (optional, can use Docker)

### Build All Services

```bash
cd backend
mvn clean install -DskipTests
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Access Points

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:8000
- **Kafka UI:** http://localhost:8080
- **User Service:** http://localhost:8081
- **Market Data API:** http://localhost:8082

## Frontend Pages

The frontend includes the following pages:

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Overview of portfolio, market indices, and recent activity |
| Markets | `/markets` | Market data, movers, and indices |
| Trading | `/trading` | Trading terminal for placing orders |
| Portfolio | `/portfolio` | Holdings, allocation, and P&L |
| Orders | `/orders` | Order history and status |
| Trades | `/trades` | Trade history and active trades |
| Funds | `/funds` | Wallet balance, deposits, withdrawals |
| Strategies | `/strategies` | Create and manage trading strategies |
| Reports | `/reports` | Generate and download reports |
| News | `/news` | Latest market news |
| ETFs | `/etf` | ETF listings |
| Alerts | `/alerts` | Price and strategy alerts |
| Company Details | `/company/:symbol` | Company information and charts |

## API Documentation

### User Service (Port 8081)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | User login |
| GET | `/api/users/me` | Get current user |
| POST | `/api/users/validate` | Validate JWT token |

### Market Data Service (Port 8082)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market-data` | Get all market data |
| GET | `/api/market-data/{symbol}` | Get market data for symbol |
| GET | `/api/market-data/quotes` | Get quotes for multiple symbols |
| GET | `/api/market-data/symbols` | Get all available symbols |
| GET | `/api/market-data/indices` | Get market indices |
| GET | `/api/market-data/most-active` | Get most active stocks |
| GET | `/api/market-data/movers` | Get top gainers/losers |
| GET | `/api/market-data/stocks/search` | Search stocks |
| GET | `/api/market-data/stocks/all` | Get all stocks |
| GET | `/api/market-data/stocks/{symbol}` | Get stock by symbol |
| GET | `/api/market-data/stocks/suggestions` | Get stock suggestions |
| GET | `/api/news` | Get market news |
| GET | `/api/news/trending` | Get trending news |
| GET | `/api/etf` | Get all ETFs |
| GET | `/api/etf/{symbol}` | Get ETF by symbol |
| GET | `/api/ipo` | Get IPO data |
| GET | `/api/commodities` | Get commodity prices |
| GET | `/api/mutual-funds` | Get mutual funds |

### Order Service (Port 8084)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place new order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{id}` | Get order by ID |
| DELETE | `/api/orders/{id}` | Cancel order |
| GET | `/api/orders/mode` | Get trading mode |

### Portfolio Service (Port 8085)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/portfolio` | Get portfolio |
| GET | `/api/portfolio/positions` | Get positions |
| GET | `/api/portfolio/summary` | Get portfolio summary |

### Strategy Engine (Port 8083)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/strategies` | Create strategy |
| GET | `/api/strategies` | Get all strategies |
| GET | `/api/strategies/{id}` | Get strategy by ID |
| PUT | `/api/strategies/{id}` | Update strategy |
| POST | `/api/strategies/{id}/start` | Start strategy |
| POST | `/api/strategies/{id}/stop` | Stop strategy |

### Risk Service (Port 8086)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/risk/limits` | Get risk limits |
| PUT | `/api/risk/limits` | Update risk limits |
| POST | `/api/risk/validate` | Validate trade |

### Backtesting Engine (Port 8087)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/backtest/run` | Run backtest |
| GET | `/api/backtest/results/{id}` | Get backtest result |

### Funds Service (Port 8093)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/funds/wallet` | Get wallet balance |
| GET | `/api/v1/funds/wallet/balance` | Get balance summary |
| POST | `/api/v1/funds/wallet/rebuild` | Rebuild wallet |
| GET | `/api/v1/funds/transactions` | Get transaction history |
| POST | `/api/v1/funds/deposit` | Initiate deposit |
| POST | `/api/v1/funds/withdraw` | Initiate withdrawal |
| GET | `/api/v1/funds/locks` | Get active locks |

### Payment Service (Port 8094)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/initiate` | Initiate payment |
| POST | `/api/v1/payments/verify` | Verify payment |
| GET | `/api/v1/payments/{id}` | Get payment details |
| GET | `/api/v1/payments/history` | Get payment history |

### Trade Service (Port 8095)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/trades` | Get all trades |
| GET | `/api/v1/trades/{id}` | Get trade by ID |
| GET | `/api/v1/trades/order/{orderId}` | Get trade by order |
| GET | `/api/v1/trades/active` | Get active trades |
| POST | `/api/v1/trades/{id}/cancel` | Cancel trade |

### Notification Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/notifications` | Get notifications |
| GET | `/api/v1/notifications/unread` | Get unread notifications |
| GET | `/api/v1/notifications/count` | Get unread count |
| DELETE | `/api/v1/notifications/{id}` | Delete notification |
| GET | `/api/v1/notifications/preferences` | Get preferences |
| POST | `/api/v1/notifications/preferences/mute-type` | Mute notification type |
| GET | `/api/v1/notifications/channels` | Get channel preferences |

### Report Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/reports` | Create report |
| GET | `/api/v1/reports` | Get all reports |
| GET | `/api/v1/reports/{id}` | Get report details |
| GET | `/api/v1/reports/{id}/download` | Download report |
| DELETE | `/api/v1/reports/{id}` | Delete report |

## WebSocket API

The realtime gateway provides WebSocket connections for real-time market data:

- **WebSocket URL:** `ws://localhost:8088/ws/market`
- **STOMP endpoints:** `/topic`, `/queue`

## Configuration

Environment variables can be configured in docker-compose.yml:

```yaml
environment:
  SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/trading_platform
  SPRING_DATASOURCE_USERNAME: trading_user
  SPRING_DATASOURCE_PASSWORD: trading_pass
  JWT_SECRET: your-secret-key
  KAFKA_BOOTSTRAP_SERVERS: kafka:29092
```

## Development

### Running Individual Services

```bash
cd backend/user-service
mvn spring-boot:run
```

### Running Frontend

```bash
cd frontend
npm install
npm run dev
```

### Running Tests

```bash
mvn test
```

## License

This project is proprietary and for internal use only.

## Contact

For questions or support, contact the development team.
