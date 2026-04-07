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
exports.deleteItem = exports.getStats = exports.upsertItem = exports.getLibrary = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const libraryService = __importStar(require("../services/library"));
const upsertSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    mediaType: zod_1.z.enum(['ARTIST', 'ALBUM', 'TRACK']),
    status: zod_1.z.enum(['TO_LISTEN', 'LISTENING', 'DONE', 'ABANDONED']),
    rating: zod_1.z.number().min(1).max(5).optional(),
    notes: zod_1.z.string().max(1000).optional(),
});
exports.getLibrary = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { status, mediaType } = req.query;
    const { data, total } = await libraryService.getLibrary(req.user.userId, pagination, { status, mediaType });
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.upsertItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = upsertSchema.parse(req.body);
    const item = await libraryService.upsertItem(req.user.userId, data);
    res.json(item);
});
exports.getStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await libraryService.getStats(req.user.userId);
    res.json(stats);
});
exports.deleteItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await libraryService.deleteItem(req.user.userId, req.params.itemId);
    res.json({ message: 'Deleted' });
});
//# sourceMappingURL=library.js.map