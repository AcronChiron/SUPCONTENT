"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const websocket_1 = require("./websocket");
const app_1 = require("./app");
const app = (0, app_1.createApp)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: env_1.env.CLIENT_WEB_URL, credentials: true },
});
exports.io = io;
(0, websocket_1.setupWebSocket)(io);
async function start() {
    try {
        await database_1.prisma.$connect();
        console.log('✅ Database connected');
        await redis_1.redis.connect();
        console.log('✅ Redis connected');
        server.listen(env_1.env.PORT, () => {
            console.log(`🚀 Server running on port ${env_1.env.PORT}`);
            if (env_1.env.NODE_ENV !== 'production') {
                console.log('📖 Swagger UI available at /api-docs');
            }
        });
    }
    catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=index.js.map