#!/bin/bash

# GitHub OAuth App Credentials Update Script
# Run this after creating your GitHub OAuth App

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                          ║"
echo "║              🔧 UPDATE GITHUB OAUTH CREDENTIALS                         ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/.env.backend" ]; then
    echo "❌ Error: backend/.env.backend not found!"
    echo "   Please run this script from the project root directory."
    exit 1
fi

echo "📝 Please enter your GitHub OAuth App credentials:"
echo ""

# Get Client ID
echo "Enter your GitHub Client ID (starts with Ov23li):"
read -r CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Error: Client ID cannot be empty!"
    exit 1
fi

# Get Client Secret
echo ""
echo "Enter your GitHub Client Secret:"
read -r CLIENT_SECRET

if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Client Secret cannot be empty!"
    exit 1
fi

echo ""
echo "🔄 Updating credentials..."
echo ""

# Update backend/.env.backend
sed -i.bak "s/^GITHUB_CLIENT_ID=.*/GITHUB_CLIENT_ID=$CLIENT_ID/" backend/.env.backend
sed -i.bak "s/^GITHUB_CLIENT_SECRET=.*/GITHUB_CLIENT_SECRET=$CLIENT_SECRET/" backend/.env.backend

# Update .env.frontend
sed -i.bak "s/^NEXT_PUBLIC_GITHUB_CLIENT_ID=.*/NEXT_PUBLIC_GITHUB_CLIENT_ID=$CLIENT_ID/" .env.frontend

echo "✅ Updated backend/.env.backend"
echo "✅ Updated .env.frontend"
echo ""

echo "📋 Your new credentials:"
echo "   Client ID: $CLIENT_ID"
echo "   Client Secret: ${CLIENT_SECRET:0:10}... (hidden)"
echo ""

echo "🔄 Next steps:"
echo "   1. Restart backend server (Ctrl+C then: cd backend && npm run dev)"
echo "   2. Test OAuth flow at: http://localhost:3000/connect-github"
echo ""

echo "✅ Done!"
