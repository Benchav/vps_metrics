// Load .env file FIRST — before any other module reads process.env
import 'dotenv/config';

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { startMonitoring, getMetricsHistory } from './monitor';

const app = express();
app.use(cors());

// --- API Routes (must be declared BEFORE static middleware and SPA fallback) ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
});

// Serve static frontend assets in production
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3012;

// SPA fallback: must be LAST — only hits if no static file or API route matched
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  // Emit history instantly for fast load
  socket.emit('metrics_history', getMetricsHistory());
  
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start the hardware monitoring loop
const stopMonitoring = startMonitoring(io);

const httpServer = server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log('🔓 Running in open mode (direct access).');
});

// Graceful Shutdown Handler
const shutdown = () => {
  console.log('\n[System] SIGTERM/SIGINT received. Shutting down gracefully...');
  stopMonitoring();
  
  io.close(() => {
    console.log('[System] Socket.IO server closed.');
  });
  
  httpServer.close(() => {
    console.log('[System] HTTP server closed.');
    process.exit(0);
  });
  
  // Force kill if graceful shutdown takes too long (10s)
  setTimeout(() => {
    console.error('[System] Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
