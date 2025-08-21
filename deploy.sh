#!/bin/bash

# EliteDevs Production Deployment Script
echo "🚀 Starting EliteDevs Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js version 16 or higher is required. Current version: $(node --version)"
    exit 1
fi
print_success "Node.js version: $(node --version)"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    print_warning "MongoDB is not running. Please start MongoDB before deployment."
    print_status "On macOS: brew services start mongodb-community"
    print_status "On Ubuntu: sudo systemctl start mongod"
fi

# Check environment file
if [ ! -f "backend/.env" ]; then
    print_error "Environment file not found. Please create backend/.env from backend/env.example"
    exit 1
fi
print_success "Environment file found"

print_status "Installing dependencies..."

# Install backend dependencies
cd backend
if npm install; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

print_status "Building for production..."

# Set production environment
export NODE_ENV=production

print_status "Starting production servers..."

# Start backend server
print_status "Starting backend server..."
node server.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/api/health > /dev/null; then
    print_success "Backend server started successfully"
else
    print_error "Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
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
    print_error "Frontend server failed to start"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

print_success "🎉 EliteDevs is now running in production mode!"
echo ""
echo "📱 Frontend: http://localhost:8000"
echo "🔧 Backend API: http://localhost:3000"
echo "🏥 Health Check: http://localhost:3000/api/health"
echo ""
echo "📋 Next Steps for Live Deployment:"
echo "1. Set up a domain (e.g., elitedevs.work)"
echo "2. Configure SSL certificates"
echo "3. Set up a production MongoDB database"
echo "4. Configure email service credentials"
echo "5. Set up a reverse proxy (nginx/apache)"
echo "6. Configure environment variables for production"
echo ""
echo "📚 Documentation: ./docs/deployment/README.md"
echo ""
echo "Press Ctrl+C to stop the servers"

# Function to cleanup on exit
cleanup() {
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
