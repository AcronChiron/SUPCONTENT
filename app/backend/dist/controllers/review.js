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
exports.report = exports.addComment = exports.getComments = exports.unlike = exports.like = exports.remove = exports.update = exports.get = exports.create = void 0;
const zod_1 = require("zod");
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const reviewService = __importStar(require("../services/review"));
const createSchema = zod_1.z.object({
    externalId: zod_1.z.string(),
    mediaType: zod_1.z.enum(['ARTIST', 'ALBUM', 'TRACK']),
    content: zod_1.z.string().min(10).max(5000),
    rating: zod_1.z.number().min(1).max(5),
    containsSpoiler: zod_1.z.boolean().optional(),
});
const updateSchema = zod_1.z.object({
    content: zod_1.z.string().min(10).max(5000).optional(),
    rating: zod_1.z.number().min(1).max(5).optional(),
    containsSpoiler: zod_1.z.boolean().optional(),
});
const commentSchema = zod_1.z.object({ content: zod_1.z.string().min(1).max(2000) });
const reportSchema = zod_1.z.object({ reason: zod_1.z.string().min(1), details: zod_1.z.string().optional() });
exports.create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = createSchema.parse(req.body);
    const review = await reviewService.createReview(req.user.userId, data);
    res.status(201).json(review);
});
exports.get = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const review = await reviewService.getReview(req.params.reviewId);
    res.json(review);
});
exports.update = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const review = await reviewService.updateReview(req.user.userId, req.params.reviewId, data);
    res.json(review);
});
exports.remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await reviewService.deleteReview(req.user.userId, req.params.reviewId);
    res.json({ message: 'Deleted' });
});
exports.like = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await reviewService.likeReview(req.user.userId, req.params.reviewId);
    res.json({ liked: true });
});
exports.unlike = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await reviewService.unlikeReview(req.user.userId, req.params.reviewId);
    res.json({ liked: false });
});
exports.getComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await reviewService.getComments(req.params.reviewId, pagination.skip, pagination.perPage);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
exports.addComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { content } = commentSchema.parse(req.body);
    const comment = await reviewService.addComment(req.user.userId, req.params.reviewId, content);
    res.status(201).json(comment);
});
exports.report = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { reason, details } = reportSchema.parse(req.body);
    const rpt = await reviewService.reportReview(req.user.userId, req.params.reviewId, reason, details);
    res.status(201).json(rpt);
});
//# sourceMappingURL=review.js.map