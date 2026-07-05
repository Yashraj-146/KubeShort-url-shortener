"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsLimiter = exports.redirectLimiter = exports.createUrlLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = require("rate-limit-redis");
const redis_1 = require("../lib/redis");
function createRateLimiter(options) {
    return (0, express_rate_limit_1.default)({
        windowMs: options.windowMs,
        max: options.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: options.message,
        },
        store: new rate_limit_redis_1.RedisStore({
            sendCommand: (...args) => redis_1.redis.sendCommand(args),
        }),
    });
}
/**
 * Google OAuth
 * 10 requests / minute
 */
exports.authLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 10,
    message: "Too many authentication requests. Please try again in one minute.",
});
/**
 * Create Short URL
 * 30 requests / minute
 */
exports.createUrlLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 30,
    message: "URL creation rate limit exceeded. Please try again later.",
});
/**
 * Redirect Endpoint
 * 200 requests / minute
 */
exports.redirectLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 200,
    message: "Too many redirect requests. Please slow down.",
});
/**
 * Analytics Endpoint
 * 60 requests / minute
 */
exports.analyticsLimiter = createRateLimiter({
    windowMs: 60 * 1000,
    max: 60,
    message: "Analytics rate limit exceeded. Please try again later.",
});
//# sourceMappingURL=rate-limit.js.map