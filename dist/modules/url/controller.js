"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlController = void 0;
const AppError_1 = require("../../errors/AppError");
const schema_1 = require("./schema");
const service_1 = require("./service");
class UrlController {
    /**
     * Create a new short URL.
     */
    static async createShortUrl(req, res, next) {
        try {
            const request = schema_1.createShortUrlSchema.parse(req.body);
            if (!req.user) {
                throw new AppError_1.AppError("Unauthorized.", 401);
            }
            const shortLink = await service_1.UrlService.createShortUrl({
                originalUrl: request.originalUrl,
                customAlias: request.customAlias,
                expiresAt: request.expiresAt
                    ? new Date(request.expiresAt)
                    : undefined,
                userId: req.user.sub,
            });
            res.status(201).json(shortLink);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Redirect to the original URL.
     */
    static async redirect(req, res, next) {
        try {
            const shortCode = Array.isArray(req.params.shortCode)
                ? req.params.shortCode[0]
                : req.params.shortCode;
            const result = await service_1.UrlService.redirect({
                shortCode,
                ipAddress: req.ip,
                userAgent: req.get("user-agent") ?? undefined,
            });
            res.redirect(302, result.originalUrl);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List all URLs created by the authenticated user.
     */
    static async listUrls(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError("Unauthorized.", 401);
            }
            const urls = await service_1.UrlService.listUserUrls(req.user.sub);
            res.status(200).json(urls);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get a single URL.
     */
    static async getUrl(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError("Unauthorized.", 401);
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const url = await service_1.UrlService.getUrl(id, req.user.sub);
            res.status(200).json(url);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Delete a URL.
     */
    static async deleteUrl(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError("Unauthorized.", 401);
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            await service_1.UrlService.deleteUrl(id, req.user.sub);
            res.sendStatus(204);
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get URL analytics.
     */
    static async getAnalytics(req, res, next) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError("Unauthorized.", 401);
            }
            const id = Array.isArray(req.params.id)
                ? req.params.id[0]
                : req.params.id;
            const analytics = await service_1.UrlService.getAnalytics(id, req.user.sub);
            res.status(200).json(analytics);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UrlController = UrlController;
//# sourceMappingURL=controller.js.map