# Use official NGINX Alpine image for smaller size
FROM nginx:alpine

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /var/cache/nginx

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Test nginx configuration
RUN nginx -t

# Create a non-root user for better security (optional but recommended)
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx-user nginx-user

# Expose port 80
EXPOSE 80

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]