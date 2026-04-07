import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { setupWebSocket } from './websocket';
import { createApp } from './app';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: env.CLIENT_WEB_URL, credentials: true },
});

setupWebSocket(io);

// Export for use in controllers that need socket
export { io };

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');

    await redis.connect();
    console.log('✅ Redis connected');

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      if (env.NODE_ENV !== 'production') {
        console.log('📖 Swagger UI available at /api-docs');
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
