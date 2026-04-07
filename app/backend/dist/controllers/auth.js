"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.oauthGithubCallback = exports.oauthGithub = exports.oauthGoogleCallback = exports.oauthGoogle = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const constants_1 = require("../config/constants");
const env_1 = require("../config/env");
const authService = __importStar(require("../services/auth"));
const ApiError_1 = require("../utils/ApiError");
function requireOAuth(provider) {
    if (provider === 'google' && (!env_1.env.OAUTH_GOOGLE_CLIENT_ID || !env_1.env.OAUTH_GOOGLE_CLIENT_SECRET)) {
        throw new ApiError_1.ApiError(503, 'Google OAuth is not configured on this server');
    }
    if (provider === 'github' && (!env_1.env.OAUTH_GITHUB_CLIENT_ID || !env_1.env.OAUTH_GITHUB_CLIENT_SECRET)) {
        throw new ApiError_1.ApiError(503, 'GitHub OAuth is not configured on this server');
    }
}
const registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
    password: zod_1.z.string().min(8).max(128),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
});
function setRefreshCookie(res, token) {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: constants_1.REFRESH_TOKEN_MAX_AGE,
        path: '/api/v1/auth',
    });
}
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = registerSchema.parse(req.body);
    const result = await authService.registerUser(data.email, data.username, data.password);
    setRefreshCookie(res, result.refreshToken);
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const result = await authService.loginUser(data.email, data.password);
    setRefreshCookie(res, result.refreshToken);
    res.json({ user: result.user, accessToken: result.accessToken });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token)
        return res.status(401).json({ error: 'No refresh token' });
    const tokens = await authService.refreshTokens(token);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json({ message: 'Logged out' });
});
exports.oauthGoogle = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    requireOAuth('google');
    const params = new URLSearchParams({
        client_id: env_1.env.OAUTH_GOOGLE_CLIENT_ID,
        redirect_uri: `${env_1.env.CLIENT_WEB_URL}/auth/oauth/google/callback`,
        response_type: 'code',
        scope: 'openid email profile',
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});
exports.oauthGoogleCallback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    requireOAuth('google');
    const { code } = req.query;
    if (!code)
        return res.status(400).json({ error: 'Missing code' });
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            code,
            client_id: env_1.env.OAUTH_GOOGLE_CLIENT_ID,
            client_secret: env_1.env.OAUTH_GOOGLE_CLIENT_SECRET,
            redirect_uri: `${env_1.env.CLIENT_WEB_URL}/auth/oauth/google/callback`,
            grant_type: 'authorization_code',
        }),
    });
    const tokenData = await tokenRes.json();
    // Get user info
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const result = await authService.findOrCreateOAuthUser('google', {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.picture,
    });
    setRefreshCookie(res, result.refreshToken);
    res.redirect(`${env_1.env.CLIENT_WEB_URL}/auth/callback?token=${result.accessToken}`);
});
exports.oauthGithub = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    requireOAuth('github');
    const params = new URLSearchParams({
        client_id: env_1.env.OAUTH_GITHUB_CLIENT_ID,
        scope: 'user:email',
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});
exports.oauthGithubCallback = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    requireOAuth('github');
    const { code } = req.query;
    if (!code)
        return res.status(400).json({ error: 'Missing code' });
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client_id: env_1.env.OAUTH_GITHUB_CLIENT_ID,
            client_secret: env_1.env.OAUTH_GITHUB_CLIENT_SECRET,
            code,
        }),
    });
    const tokenData = await tokenRes.json();
    const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = await userRes.json();
    const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const emails = await emailRes.json();
    const primaryEmail = emails.find((e) => e.primary)?.email || profile.email;
    const result = await authService.findOrCreateOAuthUser('github', {
        email: primaryEmail,
        name: profile.login,
        avatarUrl: profile.avatar_url,
    });
    setRefreshCookie(res, result.refreshToken);
    res.redirect(`${env_1.env.CLIENT_WEB_URL}/auth/callback?token=${result.accessToken}`);
});
//# sourceMappingURL=auth.js.map