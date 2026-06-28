"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlService = void 0;
const generateShortCode_1 = require("../../utils/generateShortCode");
const env_1 = require("../../config/env");
const repository_1 = require("./repository");
const AppError_1 = require("../../errors/AppError");
class UrlService {
    static async createShortUrl(data) {
        let shortCode;
        /**
         * Use custom alias if provided.
         */
        if (data.customAlias) {
            const existing = await repository_1.UrlRepository.findByCustomAlias(data.customAlias);
            if (existing) {
                throw new AppError_1.AppError("Custom alias already exists.", 409);
            }
            shortCode = data.customAlias;
        }
        else {
            /**
             * Generate a unique random short code.
             */
            do {
                shortCode = (0, generateShortCode_1.generateShortCode)(7);
            } while (await repository_1.UrlRepository.findByShortCode(shortCode));
        }
        /**
         * Persist the URL.
         */
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
}
exports.UrlService = UrlService;
//# sourceMappingURL=service.js.map