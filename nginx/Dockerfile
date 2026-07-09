FROM nginx:1.25-alpine

# Remove the default Nginx index.html and configuration files
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration file
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy custom error HTML file
COPY custom_502.html /usr/share/nginx/html/custom_502.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
