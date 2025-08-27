#!/bin/bash

echo "🚀 Starting EliteDevs Backend Server..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the server
echo "🌐 Starting server on port 3000..."
echo ""
echo "📊 Admin Dashboard will be available at:"
echo "   http://localhost:3000/admin"
echo ""
echo "🔗 API Health Check:"
echo "   http://localhost:3000/api/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js
