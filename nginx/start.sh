#!/bin/bash

# Start script for the reverse proxy server
echo "🚀 Starting Reverse Proxy Server..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js to continue."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set environment variables if not already set
export NODE_ENV="${NODE_ENV:-production}"
export PORT="${PORT:-5000}"

echo "🌐 Environment: $NODE_ENV"
echo "🔌 Port: $PORT"

# Start the server
echo "🎯 Starting server..."
npm start
