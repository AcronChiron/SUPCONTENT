export const ACCESS_TOKEN_EXPIRY = '15m';
export const REFRESH_TOKEN_EXPIRY = '30d';
export const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export const RATE_LIMIT_GLOBAL = { windowMs: 60_000, max: 100 };
export const RATE_LIMIT_AUTH = { windowMs: 60_000, max: 10 };

export const PAGINATION_DEFAULT = { page: 1, perPage: 20, maxPerPage: 100 };

export const REDIS_TTL = {
  SEARCH: 3600,          // 1h
  ENTITY: 21600,         // 6h
  YOUTUBE: 604800,       // 7d
  CHART: 1800,           // 30min
  SIMILAR: 21600,        // 6h
} as const;
