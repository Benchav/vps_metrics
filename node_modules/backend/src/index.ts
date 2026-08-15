import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { startMonitoring } from './monitor';

const app = express();
app.use(cors());

// --- API Routes (must be declared BEFORE static middleware and SPA fallback) ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
const API_KEY = process.env.API_KEY;

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (API_KEY) {
    if (token === API_KEY) {
      return next();
    }
    return next(new Error('Authentication error: Invalid API Key'));
  }
  
  // If no API_KEY is set in environment, allow connection but warn
  console.warn('[Warning] No API_KEY environment variable set. Socket connection allowed without authentication.');
  return next();
});

// SPA fallback: must be LAST — only hits if no static file or API route matched
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Start the hardware monitoring loop
startMonitoring(io);

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  if (API_KEY) {
    console.log('🔒 API Key authentication is ENABLED.');
  } else {
    console.log('⚠️ API Key authentication is DISABLED (API_KEY env variable not set).');
  }
});
