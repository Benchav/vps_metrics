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
    res.json({ status: 'ok', time: new Date().toISOString() });
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
    res.sendFile(path_1.default.join(frontendDistPath, 'index.html'));
});
io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
});
// Start the hardware monitoring loop
(0, monitor_1.startMonitoring)(io);
server.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    if (API_KEY) {
        console.log('🔒 API Key authentication is ENABLED.');
    }
    else {
        console.log('⚠️ API Key authentication is DISABLED (API_KEY env variable not set).');
    }
});
