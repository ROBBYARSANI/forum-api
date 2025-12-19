# Choose image
FROM node:20-alpine

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package.json file to the working directory
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
