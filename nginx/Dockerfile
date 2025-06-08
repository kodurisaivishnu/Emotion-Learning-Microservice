# Use official NGINX Alpine image
FROM nginx:alpine

# Create necessary directories
RUN mkdir -p /var/log/nginx && \
    mkdir -p /etc/nginx/conf.d

# Copy custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Verify the copy worked
RUN ls -la /etc/nginx/

# Expose port 80
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]