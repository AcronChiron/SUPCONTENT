"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const ApiError_1 = require("../utils/ApiError");
function errorHandler(err, _req, res, _next) {
    if (err instanceof ApiError_1.ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({ error: 'Internal server error' });
}
//# sourceMappingURL=errorHandler.js.map