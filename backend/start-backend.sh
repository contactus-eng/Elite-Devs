#!/bin/bash

# EliteDevs Backend Startup Script

echo "🚀 Starting EliteDevs Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before starting the server."
    echo "   Required: MongoDB URI, Email credentials, JWT secret"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create uploads directory if it doesn't exist
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
fi

# Start the server
echo "🌐 Starting server on http://localhost:3000"
echo "📊 Health check: http://localhost:3000/api/health"
echo "📚 API documentation: See README-BACKEND.md"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
