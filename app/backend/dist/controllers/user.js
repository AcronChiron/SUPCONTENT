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
exports.unfollow = exports.follow = exports.getFollowing = exports.getFollowers = exports.getByUsername = exports.updateMe = exports.getMe = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const userService = __importStar(require("../services/user"));
const updateSchema = zod_1.z.object({
    bio: zod_1.z.string().max(500).optional(),
    avatarUrl: zod_1.z.string().url().optional(),
    websiteUrl: zod_1.z.string().url().optional(),
    theme: zod_1.z.enum(['dark', 'light']).optional(),
    language: zod_1.z.string().max(5).optional(),
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userService.getMe(req.user.userId);
    res.json(user);
});
exports.updateMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const user = await userService.updateMe(req.user.userId, data);
    res.json(user);
});
exports.getByUsername = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await userService.getByUsername(req.params.username);
    res.json(user);
});
exports.getFollowers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await userService.getFollowers(req.params.username, pagination);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.getFollowing = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await userService.getFollowing(req.params.username, pagination);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.follow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await userService.followUser(req.user.userId, req.params.username);
    res.json(result);
});
exports.unfollow = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await userService.unfollowUser(req.user.userId, req.params.username);
    res.json(result);
});
//# sourceMappingURL=user.js.map