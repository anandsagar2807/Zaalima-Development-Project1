#!/bin/bash

# GitGuard AI - Development Startup Script
# This script installs dependencies and starts both backend and frontend servers

echo "🚀 Starting GitGuard AI Development Environment..."
echo ""

# Check if frontend/.env.frontend exists
if [ ! -f "frontend/.env.frontend" ]; then
    echo "❌ Error: frontend/.env.frontend not found!"
    echo "Please copy frontend/.env.example to frontend/.env.frontend and configure it."
    exit 1
fi

# Check if backend/.env.backend exists
if [ ! -f "backend/.env.backend" ]; then
    echo "❌ Error: backend/.env.backend not found!"
    echo "Please copy backend/.env.example to backend/.env.backend and configure it."
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Check if frontend node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install --prefix frontend
    echo ""
fi

# Check if backend node_modules exists
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install --prefix backend
    echo ""
fi

# Check if root node_modules exists (for concurrently)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
    echo ""
fi

echo "🔧 Starting Backend Server (Port 4000)..."
echo "🌐 Starting Frontend Server (Port 3000)..."
echo ""
echo "📝 Logs:"
echo "   - Backend: http://localhost:4000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npm run dev
