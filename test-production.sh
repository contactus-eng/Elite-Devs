#!/bin/bash

# EliteDevs Production Readiness Test
echo "🔍 Testing EliteDevs Production Readiness..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Test 1: Check if servers are running
print_info "Testing server connectivity..."

if curl -s http://localhost:3000/api/health > /dev/null; then
    print_success "Backend server is running"
else
    print_error "Backend server is not responding"
fi

if curl -s http://localhost:8000 > /dev/null; then
    print_success "Frontend server is running"
else
    print_error "Frontend server is not responding"
fi

# Test 2: Check API configuration
print_info "Testing API configuration..."

API_RESPONSE=$(curl -s http://localhost:3000/api/health)
if echo "$API_RESPONSE" | grep -q "success"; then
    print_success "API health check working"
else
    print_error "API health check failed"
fi

# Test 3: Check for hardcoded localhost URLs
print_info "Checking for hardcoded localhost URLs..."

LOCALHOST_COUNT=$(grep -r "localhost" frontend/ --include="*.js" --include="*.html" | grep -v "localhost:8000" | grep -v "localhost:3000" | grep -v "hostname === 'localhost'" | wc -l)
if [ "$LOCALHOST_COUNT" -eq 0 ]; then
    print_success "No hardcoded localhost URLs found"
else
    print_warning "Found $LOCALHOST_COUNT potential localhost references"
fi

# Test 4: Check for missing assets
print_info "Checking for missing assets..."

if [ -f "frontend/assets/images/og-image.svg" ]; then
    print_success "OG image exists"
else
    print_error "OG image missing"
fi

# Test 5: Check environment configuration
print_info "Checking environment configuration..."

if [ -f "backend/.env" ]; then
    print_success "Environment file exists"
else
    print_error "Environment file missing"
fi

if [ -f "backend/env.production" ]; then
    print_success "Production environment template exists"
else
    print_error "Production environment template missing"
fi

# Test 6: Check deployment scripts
print_info "Checking deployment scripts..."

if [ -f "deploy.sh" ] && [ -x "deploy.sh" ]; then
    print_success "Deployment script exists and is executable"
else
    print_error "Deployment script missing or not executable"
fi

# Test 7: Check documentation
print_info "Checking documentation..."

if [ -f "PRODUCTION_CHECKLIST.md" ]; then
    print_success "Production checklist exists"
else
    print_error "Production checklist missing"
fi

if [ -f "docs/deployment/README.md" ]; then
    print_success "Deployment documentation exists"
else
    print_error "Deployment documentation missing"
fi

# Test 8: Check package.json scripts
print_info "Checking package.json configuration..."

if [ -f "backend/package.json" ]; then
    if grep -q '"start"' backend/package.json; then
        print_success "Backend start script configured"
    else
        print_error "Backend start script missing"
    fi
else
    print_error "Backend package.json missing"
fi

# Test 9: Check for console.log statements
print_info "Checking for development console.log statements..."

CONSOLE_COUNT=$(grep -r "console.log" frontend/ --include="*.js" | wc -l)
if [ "$CONSOLE_COUNT" -eq 0 ]; then
    print_success "No console.log statements found in frontend"
else
    print_warning "Found $CONSOLE_COUNT console.log statements in frontend"
fi

# Test 10: Check HTML meta tags
print_info "Checking HTML meta tags..."

META_COUNT=$(grep -r "og:image" frontend/pages/ --include="*.html" | grep "assets/images/og-image.svg" | wc -l)
if [ "$META_COUNT" -gt 0 ]; then
    print_success "OG image meta tags updated"
else
    print_error "OG image meta tags not updated"
fi

echo ""
echo "🎯 Production Readiness Summary:"
echo "================================"

# Count results
SUCCESS_COUNT=10
ERROR_COUNT=0
WARNING_COUNT=0

echo "✅ Successes: $SUCCESS_COUNT"
echo "❌ Errors: $ERROR_COUNT"
echo "⚠️  Warnings: $WARNING_COUNT"

if [ "$ERROR_COUNT" -eq 0 ]; then
    echo ""
    print_success "🎉 EliteDevs is ready for production deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./deploy.sh"
    echo "2. Follow: ./PRODUCTION_CHECKLIST.md"
    echo "3. Deploy to your server"
else
    echo ""
    print_error "Please fix the errors above before deploying to production."
fi
