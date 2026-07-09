# --- Build/Run Stage ---
FROM node:18-alpine

# Set secure production environment
ENV NODE_ENV=production

# Set working directory
WORKDIR /usr/src/app

# Copy dependency configuration files
COPY package*.json ./

# Install only production dependencies (clean install)
RUN npm install --omit=dev

# Copy application source code
COPY src/ ./src/

# Use non-root user for container security
USER node

# Expose backend application port
EXPOSE 5000

# Start application
CMD ["npm", "start"]
