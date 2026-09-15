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

# Start the application
# Use a keep-alive command if the index.js doesn't run a server
CMD ["node", "-e", "import('./dist/index.js').then(() => { console.log('Authority Engine initialized.'); setInterval(() => {}, 3600000); }).catch(console.error);"]
