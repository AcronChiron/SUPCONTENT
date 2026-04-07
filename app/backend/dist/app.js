"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yaml_1 = __importDefault(require("yaml"));
const env_1 = require("./config/env");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const errorHandler_1 = require("./middlewares/errorHandler");
const routes_1 = require("./routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: env_1.env.CLIENT_WEB_URL, credentials: true }));
    app.use(express_1.default.json());
    app.use((0, cookie_parser_1.default)());
    // Rate limiter skipped in test env (it interferes with rapid integration tests)
    if (env_1.env.NODE_ENV !== 'test') {
        app.use(rateLimiter_1.globalLimiter);
    }
    app.use('/api/v1', routes_1.apiRouter);
    // Swagger UI (dev only)
    if (env_1.env.NODE_ENV === 'development') {
        try {
            const specPath = path_1.default.resolve(__dirname, '../openapi.yaml');
            const spec = yaml_1.default.parse(fs_1.default.readFileSync(specPath, 'utf8'));
            app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
        }
        catch (err) {
            console.warn('⚠️  Could not load OpenAPI spec:', err.message);
        }
    }
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map