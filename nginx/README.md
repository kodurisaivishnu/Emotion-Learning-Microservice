# Microservices API Gateway with Nginx

A comprehensive Nginx-based reverse proxy solution that consolidates 5 microservices into a single API gateway endpoint.

## 🏗️ Architecture

This gateway proxies requests to the following microservices:

- **Authentication Service**: User registration, login, and session management
- **Emotion Detection Service**: AI-powered emotion analysis from images
- **Analytics Service**: Student emotion and attention data logging
- **Notification Service**: Email notifications via SMTP
- **Video Service**: Video upload, management, and interaction features

## 🚀 Quick Start

### Prerequisites

- Nginx (latest stable version)
- Node.js (optional, for health monitoring)
- curl (for testing)

### Installation

1. **Clone or download the configuration files**
   ```bash
   # Ensure all files are in your working directory
   ls -la
   ```

2. **Make scripts executable**
   ```bash
   chmod +x start-nginx.sh test-api.sh
   ```

3. **Start the gateway**
   ```bash
   ./start-nginx.sh
   