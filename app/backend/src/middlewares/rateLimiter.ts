import rateLimit from 'express-rate-limit';
import { RATE_LIMIT_GLOBAL, RATE_LIMIT_AUTH } from '../config/constants';

export const globalLimiter = rateLimit({
  windowMs: RATE_LIMIT_GLOBAL.windowMs,
  max: RATE_LIMIT_GLOBAL.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_AUTH.windowMs,
  max: RATE_LIMIT_AUTH.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth requests, please try again later' },
});
