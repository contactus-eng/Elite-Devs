#!/bin/bash

# EliteDevs - Start Servers Script
echo "🚀 Starting EliteDevs Servers..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

# Kill any existing processes on ports 3000 and 8000
print_status "Stopping any existing servers..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:8000 | xargs kill -9 2>/dev/null || true

# Start backend server
print_status "Starting backend server..."
cd backend
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    print_success "Backend server started successfully"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

# Start frontend server
print_status "Starting frontend server..."
cd ../frontend
python3 -m http.server 8000 &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 2

# Check if frontend is running
if curl -s http://localhost:8000 > /dev/null; then
    print_success "Frontend server started successfully"
else
    echo "❌ Frontend server failed to start"
    exit 1
fi

echo ""
print_success "🎉 EliteDevs is now running!"
echo ""
echo "🌐 Access your website:"
echo "   Frontend: http://localhost:8000/pages/index.html"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    print_success "Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Keep script running
wait
