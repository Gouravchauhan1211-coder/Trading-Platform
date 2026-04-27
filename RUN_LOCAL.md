# Running Trading Platform Locally (Without Docker)

This guide explains how to run the entire Trading Platform microservices architecture on your local machine using PowerShell.

## Prerequisites

1.  **Java 17+**: Ensure `java -version` works.
2.  **Maven**: Ensure `mvn -version` works.
3.  **Node.js & npm**: For the frontend.
4.  **PostgreSQL**:
    -   Create a database: `trading_platform`.
    -   Create a user: `trading_user` with password `trading_pass`.
    -   Or update `application.yml` with your local credentials.
5.  **Redis**: Running on `localhost:6379`.
6.  **Apache Kafka**: Running on `localhost:9092`.

---

## Step 1: Start Infrastructure
Ensure PostgreSQL, Redis, and Kafka are running.

---

## Step 2: Build All Services
Run the following from the `backend` directory:
```powershell
cd backend
mvn clean install -DskipTests
```

---

## Step 3: Run Services (Execution Order)

You should open separate terminal windows for each service or use the provided script.

1.  **Eureka Server** (Discovery):
    ```powershell
    cd backend/eureka-server
    mvn spring-boot:run
    ```
    *Wait for it to start at http://localhost:8761*

2.  **API Gateway**:
    ```powershell
    cd backend/api-gateway
    mvn spring-boot:run
    ```
    *Starts at http://localhost:8080*

3.  **Core Services**:
    - `user-service` (p: 8081)
    - `market-data-service` (p: 8082)
    - `strategy-engine` (p: 8083)
    - `order-service` (p: 8084)
    - `portfolio-service` (p: 8085)
    - `risk-service` (p: 8086)
    - `backtesting-engine` (p: 8087)
    - `realtime-gateway` (p: 8088)

---

## Step 4: Run Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Frontend will be available at http://localhost:3000*

---

## Helper Script
You can use `RUN_LOCAL.ps1` in the root directory to start all backend services simultaneously in new windows.

```powershell
./RUN_LOCAL.ps1
```

## Troubleshooting
- **Database Connection**: Verify your Postgres instance has a database named `trading_platform`.
- **Kafka**: If services fail to start, ensure Kafka is reachable at `localhost:9092`.
- **Memory**: Running all services simultaneously requires at least 8GB-12GB of RAM.
