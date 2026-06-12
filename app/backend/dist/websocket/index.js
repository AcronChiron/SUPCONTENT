"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.emitToUser = emitToUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// Map userId -> Set of socket IDs
const userSockets = new Map();
function setupWebSocket(io) {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error('Authentication required'));
        try {
            const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            socket.userId = payload.userId;
            next();
        }
        catch {
            next(new Error('Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        const userId = socket.userId;
        // Track user socket
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);
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
                if (sockets.size === 0)
                    userSockets.delete(userId);
            }
        });
    });
}
function emitToUser(io, userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
}
//# sourceMappingURL=index.js.map