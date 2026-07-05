"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const env_1 = require("../../config/env");
const AppError_1 = require("../../errors/AppError");
const redis_1 = require("../../lib/redis");
const generateShortCode_1 = require("../../utils/generateShortCode");
const constants_1 = require("./constants");
const repository_1 = require("./repository");
class UrlService {
    /**
     * Create a new short URL.
     */
    static async createShortUrl(data) {
        let shortCode;
        if (data.customAlias) {
            const existing = await repository_1.UrlRepository.findByCustomAlias(data.customAlias);
            if (existing) {
                throw new AppError_1.AppError("Custom alias already exists.", 409);
            }
            shortCode = data.customAlias;
        }
        else {
            do {
                shortCode = (0, generateShortCode_1.generateShortCode)(constants_1.SHORT_CODE_LENGTH);
            } while (await repository_1.UrlRepository.findByShortCode(shortCode));
        }
        const shortLink = await repository_1.UrlRepository.create({
            ...data,
            shortCode,
        });
        return {
            id: shortLink.id,
            originalUrl: shortLink.originalUrl,
            shortCode: shortLink.shortCode,
            shortUrl: `${env_1.env.BASE_URL}/${shortLink.shortCode}`,
            expiresAt: shortLink.expiresAt,
            createdAt: shortLink.createdAt,
        };
    }
    /**
     * Resolve a short URL using Redis cache.
     */
    static async redirect(data) {
        const cacheKey = `${constants_1.URL_CACHE_PREFIX}${data.shortCode}`;
        /**
         * Check Redis first.
         */
        const cached = await redis_1.redis.get(cacheKey);
        if (cached) {
            console.log(`🟢 Redis Cache HIT: ${data.shortCode}`);
            const shortLink = JSON.parse(cached);
            if (shortLink.expiresAt &&
                new Date(shortLink.expiresAt) < new Date()) {
                throw new AppError_1.AppError("This short URL has expired.", 410);
            }
            await repository_1.UrlRepository.createClick({
                shortLinkId: shortLink.id,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            });
            return {
                originalUrl: shortLink.originalUrl,
            };
        }
        console.log(`🔴 Redis Cache MISS: ${data.shortCode}`);
        /**
         * Fetch from PostgreSQL.
         */
        const shortLink = await repository_1.UrlRepository.findByShortCode(data.shortCode);
        if (!shortLink) {
            throw new AppError_1.AppError("Short URL not found.", 404);
        }
        if (shortLink.expiresAt &&
            shortLink.expiresAt < new Date()) {
            throw new AppError_1.AppError("This short URL has expired.", 410);
        }
        /**
         * Store in Redis.
         */
        await redis_1.redis.set(cacheKey, JSON.stringify({
            id: shortLink.id,
            originalUrl: shortLink.originalUrl,
            expiresAt: shortLink.expiresAt,
        }), {
            EX: constants_1.URL_CACHE_TTL,
        });
        await repository_1.UrlRepository.createClick({
            shortLinkId: shortLink.id,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        });
        return {
            originalUrl: shortLink.originalUrl,
        };
    }
    /**
     * List all URLs.
     */
    static async listUserUrls(userId) {
        return repository_1.UrlRepository.findAllByUserId(userId);
    }
    /**
     * Get URL details.
     */
    static async getUrl(id, userId) {
        const shortLink = await repository_1.UrlRepository.findByIdAndUserId(id, userId);
        if (!shortLink) {
            throw new AppError_1.AppError("Short URL not found.", 404);
        }
        const totalClicks = await repository_1.UrlRepository.countClicks(shortLink.id);
        return {
            ...shortLink,
            totalClicks,
        };
    }
    /**
     * Delete URL.
     */
    static async deleteUrl(id, userId) {
        const shortLink = await repository_1.UrlRepository.findByIdAndUserId(id, userId);
        if (!shortLink) {
            throw new AppError_1.AppError("Short URL not found.", 404);
        }
        /**
         * Remove from Redis.
         */
        await redis_1.redis.del(`${constants_1.URL_CACHE_PREFIX}${shortLink.shortCode}`);
        await repository_1.UrlRepository.delete(shortLink.id);
    }
    /**
     * URL analytics.
     */
    static async getAnalytics(id, userId) {
        const shortLink = await repository_1.UrlRepository.findByIdAndUserId(id, userId);
        if (!shortLink) {
            throw new AppError_1.AppError("Short URL not found.", 404);
        }
        const totalClicks = await repository_1.UrlRepository.countClicks(shortLink.id);
        const recentClicks = await repository_1.UrlRepository.findClicks(shortLink.id);
        return {
            shortLink,
            totalClicks,
            recentClicks,
        };
    }
}
exports.UrlService = UrlService;
//# sourceMappingURL=service.js.map