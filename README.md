# 📈 QuantPulse: Enterprise-Grade Trading Platform

> **Formerly known as TradeNest** | A high-performance, distributed algorithmic trading platform built on a 16-service Spring Boot microservices architecture. Designed for real-time market data streaming, AI-powered sentiment analysis, and professional-grade algorithmic execution.

---

## ✨ Key Features

- **🤖 AI Sentiment Analysis**: Evaluates real-time news headlines to generate Bullish/Bearish scores using GPT/LLM integration.
- **⚡ Ultra-Low Latency Streaming**: WebSockets and Apache Kafka are utilized for high-throughput, real-time market data broadcasting (<10ms internal latency).
- **📊 Advanced Trading Analytics**: Dynamic, interactive charts and portfolio heatmaps for visualizing assets.
- **🛠️ 16 Decoupled Microservices**: Highly scalable, fault-tolerant architecture built with Spring Boot, ensuring each component runs independently.
- **🛡️ Distributed Tracing**: Full request lifecycle visibility utilizing Zipkin and Micrometer for deep observability.
- **📈 Infrastructure Monitoring**: Comprehensive production-ready dashboards with Prometheus and Grafana.
- **🔐 Secure Trading**: Supports Hybrid Paper/Live trading modes with multi-layered, pre-trade risk validation and margin checks.

---

## 🏗️ Architecture & Services

QuantPulse is composed of fully independent microservices handling specific domain responsibilities. 

### Microservices Ecosystem

| Service Name | Port | Primary Responsibility |
|--------------|------|------------------------|
| **API Gateway** | `8000` | Kong API Gateway acting as the central entry point. |
| **User Service** | `8081` | Identity, JWT Authentication, and Profile Management. |
| **Market Data** | `8082` | Real-time Scrapers (NSE/BSE) & AI Sentiment Engine. |
| **Strategy Engine** | `8083` | Algorithmic execution & trading signal generation. |
| **Order Service** | `8084` | Order lifecycle management backed by Redis. |
| **Portfolio** | `8085` | Real-time P&L tracking, reporting, and asset allocation. |
| **Risk Service** | `8086` | Pre-trade risk evaluation, limits validation, & margin checks. |
| **Backtesting** | `8087` | Historical strategy simulation and metrics validation. |
| **Realtime Gateway** | `8088` | Scalable WebSocket cluster for live price streaming to clients. |
| **Notification** | `8091` | Multi-channel alerts engine (Email, SMS, Push). |
| **Report Service** | `8092` | Automated PDF/CSV generation for tax, auditing, and analytics. |
| **Funds Service** | `8093` | Virtual wallet, ledger management, and balance settlement. |
| **Payment Service** | `8094` | Razorpay/Stripe payment gateway integration. |
| **Trade Service** | `8095` | Trade execution logging and post-trade settlement. |

---

## 🛠️ Technology Stack

- **Backend:** Java 17, Spring Boot 3.x, Spring Cloud (Eureka, Gateway)
- **Frontend:** React (TypeScript), Vite, TailwindCSS
- **Messaging/Streaming:** Apache Kafka
- **Databases & Caching:** PostgreSQL, Redis
- **Observability:** Prometheus, Grafana, Micrometer, Zipkin
- **Containerization:** Docker & Docker Compose

---

## 🚀 Getting Started (Local Development)

### Prerequisites
1. **Java 17+** and **Maven** installed.
2. **Node.js 18+** & npm (for frontend).
3. **Docker Desktop** (for spinning up the infrastructure).

### Step 1: Start Infrastructure
Start the required databases and messaging queues using Docker Compose:
```bash
docker-compose up -d postgres redis kafka zipkin prometheus grafana
```

### Step 2: Build the Backend Services
Navigate to the `backend/` directory and compile the services:
```bash
cd backend
mvn clean install -DskipTests
```

### Step 3: Run Essential Services
Start the foundational microservices in separate terminal windows:
```bash
# Terminal 1: Service Discovery
cd backend/eureka-server
mvn spring-boot:run

# Terminal 2: API Gateway
cd backend/api-gateway
mvn spring-boot:run

# Terminal 3: Core Services (e.g., User, Market Data)
cd backend/user-service
mvn spring-boot:run
```

### Step 4: Launch the Frontend
Navigate to the `frontend/` directory, install dependencies, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📄 License
This project is proprietary and intended for internal organizational use.

## 📞 Contact
For technical inquiries, operational support, or deployment strategies, contact the platform engineering team.
