@echo off
REM GitGuard AI - Development Startup Script (Windows)
REM This script starts both backend and frontend servers

echo.
echo ========================================
echo   GitGuard AI - Development Environment
echo ========================================
echo.

REM Check if .env.frontend exists
if not exist ".env.frontend" (
    echo [ERROR] .env.frontend not found!
    echo Please copy .env.example to .env.frontend and configure it.
    pause
    exit /b 1
)

REM Check if backend\.env.backend exists
if not exist "backend\.env.backend" (
    echo [ERROR] backend\.env.backend not found!
    echo Please copy backend\.env.example to backend\.env.backend and configure it.
    pause
    exit /b 1
)

echo [OK] Environment files found
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    echo.
)

echo [INFO] Starting servers...
echo.
echo   Backend:  http://localhost:4000
echo   Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers using npm-run-all or concurrently
REM If you have npm-run-all installed:
REM call npm-run-all --parallel dev:backend dev

REM Alternative: Start in separate windows
start "GitGuard Backend" cmd /k npm run dev:backend
timeout /t 3 /nobreak >nul
start "GitGuard Frontend" cmd /k npm run dev

echo.
echo [OK] Servers started in separate windows
echo.
pause
