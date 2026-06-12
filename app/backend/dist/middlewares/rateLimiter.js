"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.globalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const constants_1 = require("../config/constants");
exports.globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMIT_GLOBAL.windowMs,
    max: constants_1.RATE_LIMIT_GLOBAL.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_1.RATE_LIMIT_AUTH.windowMs,
    max: constants_1.RATE_LIMIT_AUTH.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many auth requests, please try again later' },
});
//# sourceMappingURL=rateLimiter.js.map