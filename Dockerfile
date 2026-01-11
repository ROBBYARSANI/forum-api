# Force Railway to use Node.js runtime
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files from forum-api-main folder
COPY forum-api-main/package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy all source code from forum-api-main
COPY forum-api-main/ .

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "start"]
