# Use official NGINX Alpine image for smaller size
FROM nginx:alpine

# Create necessary directories and set permissions
RUN mkdir -p /var/log/nginx && \
    mkdir -p /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /var/cache/nginx

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start NGINX in foreground
CMD ["nginx", "-g", "daemon off;"]