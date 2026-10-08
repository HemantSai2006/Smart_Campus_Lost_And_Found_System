@echo off
echo ===================================================================
echo   Smart Campus Lost ^& Found Management System - Microservices Runner
echo ===================================================================
echo.

set JAVA_BIN="C:\Program Files\Java\jdk-25\bin\java.exe"
if not exist %JAVA_BIN% set JAVA_BIN=java

echo [1/8] Starting Eureka Server (Port 8761)...
start "Eureka Server [8761]" cmd /k %JAVA_BIN% -jar eureka-server\target\eureka-server-1.0.0.jar
ping 127.0.0.1 -n 7 >nul

if exist .env (
    for /f "usebackq tokens=1,* delims==" %%A in (".env") do (
        set %%A=%%B
    )
)
if "%SPRING_DATASOURCE_PASSWORD%"=="" set SPRING_DATASOURCE_PASSWORD=root

echo [2/8] Starting Auth Service (Port 8081)...
start "Auth Service [8081]" cmd /k %JAVA_BIN% -jar auth-service\target\auth-service-1.0.0.jar

echo [3/8] Starting Item Service (Port 8082)...
start "Item Service [8082]" cmd /k %JAVA_BIN% -jar item-service\target\item-service-1.0.0.jar

echo [4/8] Starting Notification Service (Port 8085)...
start "Notification Service [8085]" cmd /k %JAVA_BIN% -jar notification-service\target\notification-service-1.0.0.jar

echo [5/8] Starting Matching Service (Port 8083)...
start "Matching Service [8083]" cmd /k %JAVA_BIN% -jar matching-service\target\matching-service-1.0.0.jar

echo [6/8] Starting Claim Service (Port 8084)...
start "Claim Service [8084]" cmd /k %JAVA_BIN% -jar claim-service\target\claim-service-1.0.0.jar

ping 127.0.0.1 -n 6 >nul

echo [7/8] Starting API Gateway (Port 8080)...
start "API Gateway [8080]" cmd /k %JAVA_BIN% -jar api-gateway\target\api-gateway-1.0.0.jar

echo [8/8] Starting React Frontend (Port 5173)...
start "React Frontend [5173]" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================================
echo   All microservices and frontend launched successfully!
echo   Eureka Dashboard : http://localhost:8761
echo   API Gateway      : http://localhost:8080
echo   Web Application  : http://localhost:5173
echo ===================================================================
ping 127.0.0.1 -n 4 >nul
start http://localhost:5173