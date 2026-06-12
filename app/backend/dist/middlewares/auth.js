"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
exports.requireAdmin = requireAdmin;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
function authenticate(req, _res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        throw ApiError_1.ApiError.unauthorized('Missing or invalid token');
    }
    try {
        const token = header.slice(7);
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch {
        throw ApiError_1.ApiError.unauthorized('Invalid or expired token');
    }
}
function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try {
            const token = header.slice(7);
            req.user = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        }
        catch {
            // Ignore invalid tokens for optional auth
        }
    }
    next();
}
function requireAdmin(req, _res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        throw ApiError_1.ApiError.forbidden('Admin access required');
    }
    next();
}
//# sourceMappingURL=auth.js.map