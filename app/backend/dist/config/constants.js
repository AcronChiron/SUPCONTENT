"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIS_TTL = exports.PAGINATION_DEFAULT = exports.RATE_LIMIT_AUTH = exports.RATE_LIMIT_GLOBAL = exports.REFRESH_TOKEN_MAX_AGE = exports.REFRESH_TOKEN_EXPIRY = exports.ACCESS_TOKEN_EXPIRY = void 0;
exports.ACCESS_TOKEN_EXPIRY = '15m';
exports.REFRESH_TOKEN_EXPIRY = '30d';
exports.REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
exports.RATE_LIMIT_GLOBAL = { windowMs: 60_000, max: 100 };
exports.RATE_LIMIT_AUTH = { windowMs: 60_000, max: 10 };
exports.PAGINATION_DEFAULT = { page: 1, perPage: 20, maxPerPage: 100 };
exports.REDIS_TTL = {
    SEARCH: 3600, // 1h
    ENTITY: 21600, // 6h
    YOUTUBE: 604800, // 7d
    CHART: 1800, // 30min
    SIMILAR: 21600, // 6h
};
//# sourceMappingURL=constants.js.map