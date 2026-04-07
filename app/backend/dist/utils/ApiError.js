"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
    static badRequest(message = 'Bad request') {
        return new ApiError(400, message);
    }
    static unauthorized(message = 'Unauthorized') {
        return new ApiError(401, message);
    }
    static forbidden(message = 'Forbidden') {
        return new ApiError(403, message);
    }
    static notFound(message = 'Not found') {
        return new ApiError(404, message);
    }
    static conflict(message = 'Conflict') {
        return new ApiError(409, message);
    }
    static tooMany(message = 'Too many requests') {
        return new ApiError(429, message);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map