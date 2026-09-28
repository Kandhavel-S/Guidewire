// dotenv is loaded by ./config/env on first import — do not import it again here
import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';

const server = http.createServer(app);

// ─────────────────────────────────────────────
// Socket.IO for Real-Time Updates
// ─────────────────────────────────────────────

export const io = new Server(server, {
  cors: {
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });

  // Join rooms for exception updates
  socket.on('join:exception', (exceptionId: string) => {
    socket.join(`exception:${exceptionId}`);
  });

  socket.on('leave:exception', (exceptionId: string) => {
    socket.leave(`exception:${exceptionId}`);
  });
});

// ─────────────────────────────────────────────
// Graceful Shutdown
// ─────────────────────────────────────────────

async function shutdown(signal: string) {
  console.log(`\n[Server] ${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDatabase();
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
    await connectDatabase();

    server.listen(env.PORT, () => {
      console.log('\n');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║    InsureFlow Backend — API Server            ║');
      console.log('╚══════════════════════════════════════════════╝');
      console.log(`🚀 Running on: http://localhost:${env.PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
      console.log(`🤖 AI Provider: OpenRouter | Model: ${env.OPENROUTER_MODEL}`);
      console.log(`🔑 AI Key set: ${env.OPENROUTER_API_KEY ? 'YES ✅' : 'NO ❌ (fallback mode)'}`);  
      console.log(`💡 Health check: http://localhost:${env.PORT}/health`);
      console.log('');
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

start();
