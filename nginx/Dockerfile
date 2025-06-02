# Dockerfile for Nginx API Gateway on Render
FROM nginx:alpine

# Install Node.js for health check service
RUN apk add --no-cache nodejs npm bash curl

# Set working directory
WORKDIR /app

# Copy configuration files
COPY nginx.conf /app/nginx.conf
COPY conf.d/ /app/conf.d/
COPY html/ /app/html/
COPY start-nginx.sh /app/start-nginx.sh
COPY health-check.js /app/health-check.js
COPY test-api.sh /app/test-api.sh

# Create necessary directories
RUN mkdir -p /app/logs/nginx /app/logs/run /app/logs/cache

# Make scripts executable
RUN chmod +x /app/start-nginx.sh /app/test-api.sh

# Expose port (Render assigns PORT environment variable)
EXPOSE 10000

# Start the gateway
CMD ["./start-nginx.sh"]