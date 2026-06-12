"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = generateTokens;
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.refreshTokens = refreshTokens;
exports.findOrCreateOAuthUser = findOrCreateOAuthUser;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const env_1 = require("../config/env");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
function generateTokens(userId, role) {
    const accessToken = jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_SECRET, { expiresIn: constants_1.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jsonwebtoken_1.default.sign({ userId, role }, env_1.env.JWT_REFRESH_SECRET, { expiresIn: constants_1.REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
}
async function registerUser(email, username, password) {
    const existing = await database_1.prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });
    if (existing) {
        throw ApiError_1.ApiError.conflict(existing.email === email ? 'Email already in use' : 'Username already taken');
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    const user = await database_1.prisma.user.create({
        data: { email, username, passwordHash },
        select: { id: true, email: true, username: true, role: true, avatarUrl: true, createdAt: true },
    });
    const tokens = generateTokens(user.id, user.role);
    return { user, ...tokens };
}
async function loginUser(email, password) {
    const user = await database_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    if (user.isBanned) {
        throw ApiError_1.ApiError.forbidden('Account is banned');
    }
    const valid = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!valid) {
        throw ApiError_1.ApiError.unauthorized('Invalid credentials');
    }
    const tokens = generateTokens(user.id, user.role);
    return {
        user: { id: user.id, email: user.email, username: user.username, role: user.role, avatarUrl: user.avatarUrl },
        ...tokens,
    };
}
async function refreshTokens(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.env.JWT_REFRESH_SECRET);
        const user = await database_1.prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.isBanned) {
            throw ApiError_1.ApiError.unauthorized('Invalid refresh token');
        }
        return generateTokens(user.id, user.role);
    }
    catch {
        throw ApiError_1.ApiError.unauthorized('Invalid refresh token');
    }
}
async function findOrCreateOAuthUser(provider, profile) {
    let user = await database_1.prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
        const username = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
        user = await database_1.prisma.user.create({
            data: {
                email: profile.email,
                username,
                avatarUrl: profile.avatarUrl,
            },
        });
    }
    if (user.isBanned) {
        throw ApiError_1.ApiError.forbidden('Account is banned');
    }
    return { user, ...generateTokens(user.id, user.role) };
}
//# sourceMappingURL=auth.js.map