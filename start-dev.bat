@echo off
REM GitGuard AI - Development Startup Script (Windows)
REM This script installs dependencies and starts both backend and frontend servers

echo.
echo ========================================
echo   GitGuard AI - Development Environment
echo ========================================
echo.

REM Check if frontend\.env.frontend exists
if not exist "frontend\.env.frontend" (
    echo [ERROR] frontend\.env.frontend not found!
    echo Please copy frontend\.env.example to frontend\.env.frontend and configure it.
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

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install --prefix frontend
    echo.
)

REM Check if backend node_modules exists
if not exist "backend\node_modules" (
    echo [INFO] Installing backend dependencies...
    call npm install --prefix backend
    echo.
)

REM Check if root node_modules exists (for concurrently)
if not exist "node_modules" (
    echo [INFO] Installing root dependencies...
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

REM Start both servers using concurrently
call npm run dev

echo.
echo [OK] Servers stopped
echo.
pause
