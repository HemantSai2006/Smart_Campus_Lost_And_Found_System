Write-Host "===================================================================" -ForegroundColor Cyan
Write-Host "  Smart Campus Lost & Found Management System - Microservices Runner" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Cyan

$JAVA_BIN = "C:\Program Files\Java\jdk-25\bin\java.exe"
if (-not (Test-Path $JAVA_BIN)) {
    $JAVA_BIN = "java"
}

Write-Host "`n[1/8] Starting Eureka Server (Port 8761)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title EUREKA-SERVER (8761) & `"$JAVA_BIN`" -jar eureka-server\target\eureka-server-1.0.0.jar" -WorkingDirectory $PSScriptRoot
Start-Sleep -Seconds 6

# Load environment variables from .env if present
if (Test-Path "$PSScriptRoot\.env") {
    Get-Content "$PSScriptRoot\.env" | ForEach-Object {
        if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim())
        }
    }
}
if (-not $env:SPRING_DATASOURCE_PASSWORD) {
    $env:SPRING_DATASOURCE_PASSWORD = "root"
}

Write-Host "[2/8] Starting Auth Service (Port 8081)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title AUTH-SERVICE (8081) & `"$JAVA_BIN`" -jar auth-service\target\auth-service-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Write-Host "[3/8] Starting Item Service (Port 8082)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title ITEM-SERVICE (8082) & `"$JAVA_BIN`" -jar item-service\target\item-service-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Write-Host "[4/8] Starting Notification Service (Port 8085)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title NOTIFICATION-SERVICE (8085) & `"$JAVA_BIN`" -jar notification-service\target\notification-service-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Write-Host "[5/8] Starting Matching Service (Port 8083)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title MATCHING-SERVICE (8083) & `"$JAVA_BIN`" -jar matching-service\target\matching-service-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Write-Host "[6/8] Starting Claim Service (Port 8084)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title CLAIM-SERVICE (8084) & `"$JAVA_BIN`" -jar claim-service\target\claim-service-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Start-Sleep -Seconds 5

Write-Host "[7/8] Starting API Gateway (Port 8080)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title API-GATEWAY (8080) & `"$JAVA_BIN`" -jar api-gateway\target\api-gateway-1.0.0.jar" -WorkingDirectory $PSScriptRoot

Write-Host "[8/8] Starting React Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k title FRONTEND (5173) & cd frontend & npm run dev" -WorkingDirectory $PSScriptRoot

Write-Host "`n===================================================================" -ForegroundColor Green
Write-Host "  All 7 Spring Boot Microservices and React UI successfully launched!" -ForegroundColor Green
Write-Host "  Eureka Dashboard : http://localhost:8761" -ForegroundColor Cyan
Write-Host "  API Gateway      : http://localhost:8080" -ForegroundColor Cyan
Write-Host "  Web Application  : http://localhost:5173" -ForegroundColor Cyan
Write-Host "===================================================================" -ForegroundColor Green
Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"