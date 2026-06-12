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
exports.reviewRouter = void 0;
const express_1 = require("express");
const reviewCtrl = __importStar(require("../controllers/review"));
const auth_1 = require("../middlewares/auth");
exports.reviewRouter = (0, express_1.Router)();
exports.reviewRouter.post('/', auth_1.authenticate, reviewCtrl.create);
exports.reviewRouter.get('/:reviewId', reviewCtrl.get);
exports.reviewRouter.patch('/:reviewId', auth_1.authenticate, reviewCtrl.update);
exports.reviewRouter.delete('/:reviewId', auth_1.authenticate, reviewCtrl.remove);
exports.reviewRouter.post('/:reviewId/like', auth_1.authenticate, reviewCtrl.like);
exports.reviewRouter.delete('/:reviewId/like', auth_1.authenticate, reviewCtrl.unlike);
exports.reviewRouter.get('/:reviewId/comments', reviewCtrl.getComments);
exports.reviewRouter.post('/:reviewId/comments', auth_1.authenticate, reviewCtrl.addComment);
exports.reviewRouter.post('/:reviewId/report', auth_1.authenticate, reviewCtrl.report);
//# sourceMappingURL=review.js.map