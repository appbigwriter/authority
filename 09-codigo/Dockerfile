FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Build the project
RUN npm run build

# Expose port
EXPOSE 3400

# Start the application
CMD ["node", "dist/start.js"]
