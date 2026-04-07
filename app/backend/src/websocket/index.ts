import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtPayload } from '../middlewares/auth';

// Map userId -> Set of socket IDs
const userSockets = new Map<string, Set<string>>();

export function setupWebSocket(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      (socket as any).userId = payload.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId as string;

    // Track user socket
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    socket.on('message:read', (data) => {
      // Handled by message controller
    });

    socket.on('typing:start', (data) => {
      if (data.conversationWith) {
        io.to(`user:${data.conversationWith}`).emit('typing:start', { userId });
      }
    });

    socket.on('typing:stop', (data) => {
      if (data.conversationWith) {
        io.to(`user:${data.conversationWith}`).emit('typing:stop', { userId });
      }
    });

    socket.on('disconnect', () => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
    });
  });
}

export function emitToUser(io: Server, userId: string, event: string, data: any) {
  io.to(`user:${userId}`).emit(event, data);
}
