import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { startMonitoring } from './monitor';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3012;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
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
});
