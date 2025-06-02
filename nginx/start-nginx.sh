#!/bin/bash

# Nginx Startup Script for API Gateway
# This script sets up and starts Nginx with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    case $status in
        "SUCCESS") echo -e "${GREEN}✅ $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️  $message${NC}" ;;
    esac
}

print_status "INFO" "Starting API Gateway Setup..."

# Check if running as root (required for port 80)
if [ "$EUID" -eq 0 ]; then
    print_status "WARNING" "Running as root - this is okay for Docker containers"
fi

# Create necessary directories
print_status "INFO" "Creating directory structure..."
mkdir -p logs
mkdir -p logs/nginx
mkdir -p logs/cache
mkdir -p logs/run

# Set permissions
chmod 755 logs
chmod 755 logs/nginx 2>/dev/null || true
chmod 755 logs/cache 2>/dev/null || true

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    print_status "ERROR" "Nginx is not installed!"
    print_status "INFO" "Please install Nginx first:"
    print_status "INFO" "  Ubuntu/Debian: sudo apt-get install nginx"
    print_status "INFO" "  CentOS/RHEL: sudo yum install nginx"
    print_status "INFO" "  Alpine: apk add nginx"
    exit 1
fi

# Check Nginx configuration
print_status "INFO" "Testing Nginx configuration..."
# Create PID directory first
mkdir -p logs/run
if nginx -t -c $(pwd)/nginx.conf -p $(pwd)/; then
    print_status "SUCCESS" "Nginx configuration is valid"
else
    print_status "ERROR" "Nginx configuration test failed!"
    exit 1
fi

# Stop any existing Nginx processes
print_status "INFO" "Stopping any existing Nginx processes..."
pkill nginx 2>/dev/null || true
sleep 2

# Start health check service in background (optional)
if [ -f "health-check.js" ] && command -v node &> /dev/null; then
    print_status "INFO" "Starting health check service..."
    nohup node health-check.js > logs/health-check.log 2>&1 &
    HEALTH_PID=$!
    echo $HEALTH_PID > logs/health-check.pid
    print_status "SUCCESS" "Health check service started (PID: $HEALTH_PID)"
else
    print_status "WARNING" "Health check service not started (Node.js not found or health-check.js missing)"
fi

# Start Nginx
print_status "INFO" "Starting Nginx API Gateway..."
nginx -c $(pwd)/nginx.conf -p $(pwd)/

# Check if Nginx started successfully
sleep 2
if pgrep nginx > /dev/null; then
    NGINX_PID=$(pgrep nginx | head -1)
    echo $NGINX_PID > logs/nginx.pid
    print_status "SUCCESS" "Nginx started successfully (PID: $NGINX_PID)"
    print_status "SUCCESS" "API Gateway is running on port 5000"
    
    # Display service information
    echo ""
    print_status "INFO" "Service URLs:"
    echo "  🌐 Main Gateway: http://localhost:10000"
    echo "  🏥 Health Check: http://localhost:10000/health"
    echo "  🔐 Auth Service: http://localhost:10000/api/auth/"
    echo "  😊 Emotion Service: http://localhost:10000/api/emotion-service"
    echo "  📊 Analytics Service: http://localhost:10000/api/logs/"
    echo "  📧 Notification Service: http://localhost:10000/api/send-email"
    echo "  🎥 Video Service: http://localhost:10000/api/videos"
    echo ""
    
    # Test basic connectivity
    print_status "INFO" "Testing basic connectivity..."
    if curl -s http://localhost:10000/health > /dev/null; then
        print_status "SUCCESS" "Gateway health check passed"
    else
        print_status "WARNING" "Gateway health check failed - service may still be starting"
    fi
    
    echo ""
    print_status "INFO" "To test the API endpoints, run: ./test-api.sh"
    print_status "INFO" "To stop the gateway, run: pkill nginx"
    print_status "INFO" "Log files are in: logs/ and /var/log/nginx/"
    
else
    print_status "ERROR" "Failed to start Nginx!"
    print_status "INFO" "Check the error log: tail -f /var/log/nginx/error.log"
    exit 1
fi

# Function to handle cleanup on exit
cleanup() {
    print_status "INFO" "Shutting down services..."
    pkill nginx 2>/dev/null || true
    if [ -f "logs/health-check.pid" ]; then
        kill $(cat logs/health-check.pid) 2>/dev/null || true
        rm -f logs/health-check.pid
    fi
    print_status "SUCCESS" "Services stopped"
}

# Set up signal handlers for graceful shutdown
trap cleanup EXIT INT TERM

# Keep the script running if started interactively
if [ -t 0 ]; then
    print_status "INFO" "Press Ctrl+C to stop the gateway"
    while true; do
        sleep 1
    done
fi
