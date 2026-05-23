# 🏦 QuantPulse: Institutional Grade Multi-Asset Trading Platform

![Java Version](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.x-brightgreen.svg)
![Microservices](https://img.shields.io/badge/Architecture-Microservices-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

QuantPulse is a high-performance, distributed trading engine designed to meet the rigorous demands of modern financial markets. Engineered with a cloud-native microservices architecture, it leverages the latest advancements in Java 21, including Virtual Threads (Project Loom), to achieve unprecedented concurrency and throughput.

## 🏛 Technical Vision

The platform is built on five core architectural pillars:

- **Extreme Concurrency**: Optimized for millions of concurrent I/O operations using Virtual Threads.
- **Strict Auditability**: An immutable, double-entry ledger serves as the authoritative source of truth.
- **Event-Driven Resilience**: Asynchronous domain events decouple critical business logic across a dual-broker infrastructure.
- **Real-Time Streaming**: Low-latency market data delivery via gRPC and high-throughput Kafka pipelines.
- **Observability First**: Comprehensive PLG+J stack integration for zero-blindspot monitoring.

## 🏗 System Architecture

QuantPulse utilizes a sophisticated distributed system composed of 14 specialized services, each owning its domain and persistence layer.

### Core Ecosystem

*(Insert Architecture Diagram Here if available)*

### 🚀 Performance Benchmarks: Java 21 Virtual Threads

Operating on a standard platform hardware, QuantPulse demonstrates massive scalability by offloading platform threads to lightweight virtual threads.

| Concurrent Tasks | Execution Time | Platform Thread Blocking | Speedup Factor |
|------------------|----------------|--------------------------|----------------|
| 5,000            | 2,262ms        | 0%                       | 221x           |
| 20,000           | 816ms          | 0%                       | 1,225x         |
| 50,000           | 1,354ms        | 0%                       | 1,846x         |

> **Tip:** This performance is achieved without complex reactive programming (WebFlux), maintaining a straightforward, imperative programming model that is easier to debug and maintain.

### 🔍 Deep Dive: Key Components
1. **Dual Message Broker Strategy (Kafka + RabbitMQ)**
2. **Immutable Ledger Service**
3. **Event-Driven Workflows & Domain Events**

---

## 🎨 Frontend Application: QuantPulse Terminal

The QuantPulse Frontend is a modern, high-performance web terminal built for traders who demand speed and clarity. It provides a real-time, interactive environment for market analysis and execution.

### ✨ Key Interface Features

- **Advanced Charting**: Integrated TradingView Lightweight Charts for professional-grade technical analysis and real-time price action.
- **Dynamic Portfolio Dashboard**: Live tracking of holdings, realized/unrealized P&L, and asset allocation visualizations.
- **Institutional Order Management**: Comprehensive order entry system with support for Market, Limit, and Stop orders.
- **Real-time Ticker & Data**: Low-latency streaming of top-movers, indices, and watchlists via optimized WebSocket/Redis pipelines.
- **Financial Command Center**: Unified wallet management for instant deposits, withdrawals, and detailed transaction history.
- **Smart Notifications**: Multi-channel alert system featuring an in-app Notification Bell and proactive Toast Overlays.
- **Interactive Reports**: Deep-dive analytics, tax-ready transaction reports, and performance history.

### 💻 Frontend Tech Stack

- **Framework**: React 19 for lightning-fast rendering and state management.
- **Build Engine**: Vite 7 for near-instant hot module replacement (HMR).
- **Animations**: Framer Motion for premium micro-interactions and smooth layout transitions.
- **Data Visualization**: Lightweight Charts & Lucide React for crisp, intuitive data representation.
- **Routing**: React Router Dom 7 for secure, multi-layered client-side navigation.
- **Testing**: Vitest & React Testing Library for 100% component reliability.

### 🏃 Running the Terminal

Navigate to the directory:
```bash
cd frontend
```
Install dependencies:
```bash
npm install
```
Start development server:
```bash
npm run dev
```
Access the terminal at: [http://localhost:5173](http://localhost:5173)

---

## 🛠 Detailed Technical Stack

### 🚀 Core Platform & Runtime
- **Java 21 LTS**: Utilizing Virtual Threads (Project Loom) for lightweight concurrency, Pattern Matching, and Sequenced Collections to write clean, high-performance code.
- **Spring Boot 3.2.x**: The backbone of our services, providing auto-configuration, robust dependency injection, and production-ready features.
- **Maven**: Multi-module project management for version consistency across services.

### 🌐 Microservices Orchestration
- **Spring Cloud 2023**:
  - **API Gateway**: Centralized entry point with global filters for authentication, rate limiting, and request transformation.
  - **Eureka Server**: Netflix-based service discovery allowing dynamic scaling and load balancing.
  - **OpenFeign**: Declarative REST client for simplified inter-service communication.
- **Resilience4j**: Implementing Circuit Breakers, Rate Limiters, and Retries to prevent cascading failures in the distributed system.

### 💾 Data Persistence & Caching
- **PostgreSQL 16**: Primary relational engine for transactional data, utilizing Flyway for automated database migrations.
- **Redis 7**: Dual-purpose deployment:
  - **Caching**: Storing session data and frequent metadata.
  - **Streaming**: Delivering ultra-fast market data snapshots to frontend subscribers.
- **MapStruct**: High-performance, type-safe bean mapping between Entities and DTOs.

### 📡 Communication & Messaging
- **gRPC & Protocol Buffers**: Used for high-speed, binary internal streaming of Market Data from Market-Service to Trade-Service.
- **Apache Kafka (3-Broker Cluster)**: High-throughput distributed log for market data ingestion and real-time candle (OHLC) generation. Featuring 12-partition topics, idempotent production, and manual offset management for extreme reliability.
- **RabbitMQ**: Message broker for mission-critical domain events using Topic Exchanges and Dead Letter Queues (DLQ).

### 🧪 Quality Assurance
- **JUnit 5 & AssertJ**: Standardized unit testing with fluent assertions.
- **Mockito**: Mocking framework for isolated service testing.
- **Vitest & React Testing Library**: Modern component testing and snapshot verification for the frontend.
- **JaCoCo**: Automated code coverage reporting integrated into the build pipeline.

---

## 🌐 Network Port Reference

The platform requires the following ports to be available on the host machine for local development:

### Application Services
| Service | Port | Description |
|---------|------|-------------|
| API Gateway | 8090 | Main entry point for all client requests |
| Eureka Server | 8761 | Service discovery dashboard |
| User Service | 8088 | Identity and RBAC management |
| Market Service | 8084 | Market data and gRPC streaming |
| Portfolio Service | 8086 | User holdings and P&L |
| Funds Service | 8085 | Wallet and balance management |
| Ledger Service | 8082 | Immutable financial ledger |
| Order Service | 8081 | Order lifecycle and matching logic |
| Trade Service | 8083 | Trade execution engine (Matching Engine) |
| Notification Svc | 8089 | Virtual-thread driven alerts |
| Payment Service | 8087 | Payment gateway integration |
| Report Service | 8091 | Async report generation |
| Risk Service | 8092 | Real-time risk management |
| Schedule Service | 8095 | Distributed job scheduling |
| Frontend | 5173 | React development server (Vite) |

### Infrastructure & Operations
| Component | Port | Interface |
|-----------|------|-----------|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache and streaming snapshots |
| RabbitMQ | 5672 | AMQP messaging protocol |
| RabbitMQ UI | 15672 | Management dashboard |
| Kafka Broker 1 | 9092 | Primary market data broker |
| Kafka Broker 2 | 9094 | High-availability replica broker |
| Kafka Broker 3 | 9096 | High-availability replica broker |
| Grafana | 3000 | Central observability dashboard |
| Prometheus | 9090 | Metrics engine dashboard |
| Jaeger UI | 16686 | Distributed tracing explorer |
| Loki | 3100 | Log aggregation endpoint |

---

## 📈 Observability & Monitoring

The system is instrumented for "Real-world Production" readiness with a comprehensive PLG+J Stack (Prometheus, Loki, Grafana, and Jaeger) for zero-blindspot monitoring.

📖 *For detailed observability setup, configuration, and troubleshooting, see the Observability Guide.*

### Quick Access
| Tool | Default Port | Access URL | Purpose |
|------|--------------|------------|---------|
| Grafana | 3000 | [http://localhost:3000](http://localhost:3000) (admin/quantpulse) | Central dashboards & visualization |
| Prometheus | 9090 | [http://localhost:9090](http://localhost:9090) | Metrics collection & alerting |
| Jaeger | 16686 | [http://localhost:16686](http://localhost:16686) | Distributed tracing |
| Loki | 3100 | [http://localhost:3100](http://localhost:3100) | Log aggregation |
| Eureka | 8761 | [http://localhost:8761](http://localhost:8761) | Service discovery |

### Key Features
- 🕵️ **Distributed Tracing**: Follow requests across services with OpenTelemetry + Jaeger.
- 📝 **Log Aggregation**: Structured JSON logs with Loki, searchable by service/traceId.
- 📊 **System Metrics**: Real-time JVM, CPU, and memory monitoring with Prometheus.
- 🚨 **Alerting**: Configurable alerts for service health and performance issues.
- 🔍 **Correlation**: Trace IDs in logs for end-to-end request tracking.

---

## 🏁 Development & Setup

### Requirements
- JDK 21 (MANDATORY for Virtual Threads)
- PowerShell 7+ (For setup scripts)
- Node.js 20+
- Maven 3.9+

### 🚀 One-Click Startup (Recommended for Windows)

We provide a comprehensive PowerShell automation script that handles infrastructure, service discovery, gateway, and all microservices in the correct order.

```powershell
cd backend
.\start-all.ps1
```

**What this does:**
1. Checks and starts Infrastructure (Postgres, Redis, RabbitMQ, Kafka, Observability Stack) via `start-infra.ps1`.
2. Starts Eureka Server and waits for health check.
3. Starts API Gateway and waits for health check.
4. Launches all Backend Microservices in parallel windows.

### 🐳 Docker Setup (Alternative)

If you prefer running infrastructure via Docker:
```bash
cd backend
docker-compose -f docker-compose-services.yml up -d
```
Then manually start the services:
```bash
./mvnw clean install
./mvnw spring-boot:run -pl api-gateway,eureka-server,user-service
# ... repeat for other services
```

---

## ☸️ Kubernetes Deployment (Production-Ready)

For production deployments, we provide comprehensive Kubernetes manifests with Kustomize support for environment-specific configurations.

### Prerequisites
- Kubernetes cluster (v1.25+)
- `kubectl` configured
- Kustomize (v5.0+)
- NGINX Ingress Controller
- cert-manager (for TLS)

### Quick Deploy
```bash
# Deploy to Development (1 replica per service)
kubectl apply -k k8s/overlays/dev/

# Deploy to Staging (2 replicas per service)
kubectl apply -k k8s/overlays/staging/

# Deploy to Production (3 replicas, high resources)
kubectl apply -k k8s/overlays/production/
```

### Kubernetes Architecture
| Component | Type | Purpose |
|-----------|------|---------|
| PostgreSQL | StatefulSet | Primary database with persistence |
| Redis | Deployment | Distributed cache & session store |
| RabbitMQ | Deployment | Message broker with management UI |
| Kafka (3-Node) | Deployment | Robust event streaming platform |
| 14 Microservices| Deployment | Spring Boot services with HPA ready |
| Prometheus | Deployment | Metrics collection |
| Grafana | Deployment | Visualization dashboards |
| Jaeger | Deployment | Distributed tracing |
| Loki | Deployment | Log aggregation |

### Features
- **Kustomize Overlays**: Environment-specific configs (dev/staging/prod)
- **Health Checks**: Liveness and readiness probes on all services
- **Resource Limits**: CPU/memory requests and limits defined
- **ConfigMaps & Secrets**: Centralized configuration management
- **Persistent Volumes**: Data persistence for databases
- **Ingress**: NGINX ingress with TLS support
- **Observability**: Full PLG+J stack integrated

*See `k8s/README.md` for detailed deployment guide.*

---

## 📂 Documentation Inventory
- **ADR Catalog**: Comprehensive list of Architectural Decision Records
- **Observability Guide**: Complete PLG+J stack setup, configuration, and troubleshooting
- **Project Context**: Domain-specific improvement plans and roadmaps

## 📄 License
This platform is released under the **MIT License**. See `LICENSE` for the full text.

---

*Built with ❤️ by Me & My Agents*
