# Force Railway to use Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from root directory
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy all source code from root
COPY src ./src
COPY migrations ./migrations
COPY migrate-and-start.js .

# Expose port (Railway will provide PORT environment variable)
EXPOSE 8080

# Set default PORT env var for Railway
ENV PORT=8080 \
    HOST=0.0.0.0 \
    NODE_ENV=production

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]