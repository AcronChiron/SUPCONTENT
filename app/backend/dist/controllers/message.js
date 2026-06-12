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
exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const messageService = __importStar(require("../services/message"));
const sendSchema = zod_1.z.object({ content: zod_1.z.string().min(1).max(2000) });
exports.getConversations = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const conversations = await messageService.getConversations(req.user.userId);
    res.json({ data: conversations });
});
exports.getMessages = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await messageService.getMessages(req.user.userId, req.params.username, pagination.skip, pagination.perPage);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.sendMessage = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { content } = sendSchema.parse(req.body);
    const message = await messageService.sendMessage(req.user.userId, req.params.username, content);
    res.status(201).json(message);
});
//# sourceMappingURL=message.js.map