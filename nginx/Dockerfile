FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
# Create log dir (optional, but ensures NGINX starts)
RUN mkdir -p /var/log/nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]