# 🚀 TradeNest: Enterprise-Grade Trading Platform

TradeNest is a high-performance, distributed algorithmic trading platform built with a 16-service Spring Boot microservices architecture. Designed for the Indian stock markets (NSE/BSE), it combines real-time data streaming, AI-powered sentiment analysis, and professional-grade infrastructure monitoring.

---

## ✨ Key Features

- **🤖 AI Sentiment Analysis**: Real-time "Bullish/Bearish" scores for news headlines using GPT/LLM integration.
- **⚡ Ultra-Low Latency**: Real-time market data streaming via Kafka and WebSockets with <10ms internal latency.
- **📊 Advanced Analytics**: Interactive TradingView-style charts and portfolio heatmaps.
- **🛠️ 16 Microservices**: Fully decoupled architecture for extreme scalability and fault tolerance.
- **🛡️ Distributed Tracing**: Full request lifecycle tracking using Zipkin and Micrometer.
- **📈 Infrastructure Monitoring**: Production-ready dashboards with Prometheus and Grafana.
- **🔐 Secure Trading**: Hybrid Paper/Live trading modes with multi-layered risk validation.

---

## 🏗️ Architecture & Services

### Microservices Ecosystem

| Service | Port | Description |
|---------|------|-------------|
| **User Service** | 8081 | IAM, JWT Auth, and Profile Management |
| **Market Data** | 8082 | Real-time NSE/BSE Scrapers, AI Sentiment Engine |
| **Strategy Engine**| 8083 | Algorithmic execution & Signal generation |
| **Order Service** | 8084 | Order lifecycle management (Redis-backed) |
| **Portfolio** | 8085 | Real-time P&L tracking & Asset allocation |
| **Risk Service** | 8086 | Pre-trade risk validation & Margin checks |
| **Backtesting** | 8087 | Historical strategy validation & Metrics |
| **Realtime Gateway**| 8088 | WebSocket cluster for live price streaming |
| **Notification** | 8091 | Multi-channel alerts (Email, SMS, Push) |
| **Report Service** | 8092 | PDF/CSV generation for tax and audit |
| **Funds Service** | 8093 | Virtual wallet and ledger management |
| **Payment Service**| 8094 | Razorpay/Stripe payment gateway |
| **Trade Service** | 8095 | Trade execution and settlement |
| **API Gateway** | 8000 | Kong API Gateway (Entry point) |

### Infrastructure Stack

| Component | Port | Description |
|-----------|------|-------------|
mvn test
```

## License

This project is proprietary and for internal use only.

## Contact

For questions or support, contact the development team.
