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
exports.removeItem = exports.addItem = exports.deleteList = exports.updateList = exports.getList = exports.createList = exports.getLists = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const listService = __importStar(require("../services/list"));
const createSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().max(500).optional(),
    isPublic: zod_1.z.boolean().optional(),
});
const addItemSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    mediaType: zod_1.z.enum(['ARTIST', 'ALBUM', 'TRACK']),
});
exports.getLists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await listService.getLists(req.user.userId, pagination);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.createList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = createSchema.parse(req.body);
    const list = await listService.createList(req.user.userId, data);
    res.status(201).json(list);
});
exports.getList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const list = await listService.getList(req.params.listId, req.user?.userId);
    res.json(list);
});
exports.updateList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = createSchema.partial().parse(req.body);
    const list = await listService.updateList(req.user.userId, req.params.listId, data);
    res.json(list);
});
exports.deleteList = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await listService.deleteList(req.user.userId, req.params.listId);
    res.json({ message: 'Deleted' });
});
exports.addItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = addItemSchema.parse(req.body);
    const item = await listService.addItem(req.user.userId, req.params.listId, data);
    res.status(201).json(item);
});
exports.removeItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await listService.removeItem(req.user.userId, req.params.listId, req.params.externalId);
    res.json({ message: 'Removed' });
});
//# sourceMappingURL=list.js.map