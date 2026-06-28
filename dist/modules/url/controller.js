"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlController = void 0;
const schema_1 = require("./schema");
const service_1 = require("./service");
class UrlController {
    static async createShortUrl(req, res, next) {
        try {
            /**
             * Validate request body.
             */
            const request = schema_1.createShortUrlSchema.parse(req.body);
            /**
             * Ensure the user is authenticated.
             */
            if (!req.user) {
                throw new Error("Unauthorized.");
            }
            /**
             * Create the short URL.
             */
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
}
exports.UrlController = UrlController;
//# sourceMappingURL=controller.js.map