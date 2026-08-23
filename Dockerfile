FROM node:20-alpine

# Install PM2 globally
RUN npm install -g pm2

WORKDIR /app

# Copy root package and workspace config
COPY package.json ./

# Copy package.jsons for workspaces
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build backend (TypeScript)
RUN npm run build -w backend

# Build frontend (React/Vite)
RUN npm run build -w frontend

# Expose required port
EXPOSE 3012

# Start the service using PM2
CMD ["pm2-runtime", "ecosystem.config.js"]
