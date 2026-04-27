# Helper script to start Trading Platform services in separate windows
# Run this from the project root

$services = @(
    @{ name = "Eureka Server"; path = "backend\eureka-server"; port = 8761 },
    @{ name = "API Gateway"; path = "backend\api-gateway"; port = 8080 },
    @{ name = "User Service"; path = "backend\user-service"; port = 8081 },
    @{ name = "Market Data Service"; path = "backend\market-data-service"; port = 8082 },
    @{ name = "Strategy Engine"; path = "backend\strategy-engine"; port = 8083 },
    @{ name = "Order Service"; path = "backend\order-service"; port = 8084 },
    @{ name = "Portfolio Service"; path = "backend\portfolio-service"; port = 8085 },
    @{ name = "Risk Service"; path = "backend\risk-service"; port = 8086 },
    @{ name = "Backtesting Engine"; path = "backend\backtesting-engine"; port = 8087 },
    @{ name = "Realtime Gateway"; path = "backend\realtime-gateway"; port = 8088 }
)

Write-Host "--- Starting Trading Platform Services ---" -ForegroundColor Cyan

foreach ($service in $services) {
    Write-Host "Starting $($service.name) on port $($service.port)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $($service.path); mvn spring-boot:run"
    
    if ($service.name -eq "Eureka Server") {
        Write-Host "Waiting for Eureka to initialize..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
    } else {
        Start-Sleep -Seconds 5
    }
}

Write-Host "--- All backend services started in separate windows ---" -ForegroundColor Cyan
Write-Host "Now start the frontend by running 'npm run dev' in the frontend folder." -ForegroundColor White
