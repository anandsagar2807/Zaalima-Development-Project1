#!/bin/bash

# GitGuard AI - Development Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting GitGuard AI Development Environment..."
echo ""

# Check if .env.frontend exists
if [ ! -f ".env.frontend" ]; then
    echo "❌ Error: .env.frontend not found!"
    echo "Please copy .env.example to .env.frontend and configure it."
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

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
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
npm run dev:backend & npm run dev

# Wait for both processes
wait
