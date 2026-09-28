"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const server = http_1.default.createServer(app_1.default);
// ─────────────────────────────────────────────
// Socket.IO for Real-Time Updates
// ─────────────────────────────────────────────
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: [env_1.env.FRONTEND_URL, 'http://localhost:3000'],
        credentials: true,
    },
});
exports.io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
    // Join rooms for exception updates
    socket.on('join:exception', (exceptionId) => {
        socket.join(`exception:${exceptionId}`);
    });
    socket.on('leave:exception', (exceptionId) => {
        socket.leave(`exception:${exceptionId}`);
    });
});
// ─────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────
async function shutdown(signal) {
    console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        await (0, database_1.disconnectDatabase)();
        console.log('[Server] Server closed.');
        process.exit(0);
    });
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
async function start() {
    try {
        await (0, database_1.connectDatabase)();
        server.listen(env_1.env.PORT, () => {
            console.log('\n');
            console.log('╔══════════════════════════════════════════════╗');
            console.log('║    InsureFlow Backend — API Server            ║');
            console.log('╚══════════════════════════════════════════════╝');
            console.log(`🚀 Running on: http://localhost:${env_1.env.PORT}`);
            console.log(`🌍 Environment: ${env_1.env.NODE_ENV}`);
            console.log(`🔗 Frontend URL: ${env_1.env.FRONTEND_URL}`);
            console.log(`🤖 AI Model: ${env_1.env.AI_MODEL}`);
            console.log(`💡 Health check: http://localhost:${env_1.env.PORT}/health`);
            console.log('');
        });
    }
    catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map