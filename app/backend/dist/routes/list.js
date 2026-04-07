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
exports.listRouter = void 0;
const express_1 = require("express");
const listCtrl = __importStar(require("../controllers/list"));
const auth_1 = require("../middlewares/auth");
exports.listRouter = (0, express_1.Router)();
exports.listRouter.get('/', auth_1.authenticate, listCtrl.getLists);
exports.listRouter.post('/', auth_1.authenticate, listCtrl.createList);
exports.listRouter.get('/:listId', auth_1.optionalAuth, listCtrl.getList);
exports.listRouter.patch('/:listId', auth_1.authenticate, listCtrl.updateList);
exports.listRouter.delete('/:listId', auth_1.authenticate, listCtrl.deleteList);
exports.listRouter.post('/:listId/items', auth_1.authenticate, listCtrl.addItem);
exports.listRouter.delete('/:listId/items/:externalId', auth_1.authenticate, listCtrl.removeItem);
//# sourceMappingURL=list.js.map