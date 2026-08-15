FROM node:20-alpine

# Install PM2 and serve globally
RUN npm install -g pm2 serve

WORKDIR /app

# Copy root package and workspace config
COPY package.json ./

# Copy package.jsons for workspaces
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build backend (TypeScript)
RUN npm run build -w backend

# Build frontend (React/Vite)
RUN npm run build -w frontend

# Expose required ports
EXPOSE 3012 3015

# Start both services using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
