"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load .env file FIRST — before any other module reads process.env
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const monitor_1 = require("./monitor");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
// --- API Routes (must be declared BEFORE static middleware and SPA fallback) ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
});
// Serve static frontend assets in production
const frontendDistPath = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendDistPath));
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const PORT = process.env.PORT || 3012;
// SPA fallback: must be LAST — only hits if no static file or API route matched
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
});
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    // Emit history instantly for fast load
    socket.emit('metrics_history', (0, monitor_1.getMetricsHistory)());
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});
// Start the hardware monitoring loop
const stopMonitoring = (0, monitor_1.startMonitoring)(io);
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
