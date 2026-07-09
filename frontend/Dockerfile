# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# --- Production Serving Stage ---
FROM nginx:1.25-alpine

# Copy custom Nginx configuration for serving SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static site from build stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
