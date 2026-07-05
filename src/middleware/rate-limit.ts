import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";

import { redis } from "../lib/redis";

function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
      success: false,
      message: options.message,
    },

    store: new RedisStore({
      sendCommand: (...args: string[]) =>
        redis.sendCommand(args),
    }),
  });
}

/**
 * Google OAuth
 * 10 requests / minute
 */
export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message:
    "Too many authentication requests. Please try again in one minute.",
});

/**
 * Create Short URL
 * 30 requests / minute
 */
export const createUrlLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message:
    "URL creation rate limit exceeded. Please try again later.",
});

/**
 * Redirect Endpoint
 * 200 requests / minute
 */
export const redirectLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
  message:
    "Too many redirect requests. Please slow down.",
});

/**
 * Analytics Endpoint
 * 60 requests / minute
 */
export const analyticsLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message:
    "Analytics rate limit exceeded. Please try again later.",
});