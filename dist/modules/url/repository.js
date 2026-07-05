"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlRepository = void 0;
const prisma_1 = require("../../lib/prisma");
class UrlRepository {
    /**
     * Find a short link by its short code.
     */
    static async findByShortCode(shortCode) {
        return prisma_1.prisma.shortLink.findUnique({
            where: {
                shortCode,
            },
        });
    }
    /**
     * Find a short link by custom alias.
     */
    static async findByCustomAlias(customAlias) {
        return prisma_1.prisma.shortLink.findUnique({
            where: {
                shortCode: customAlias,
            },
        });
    }
    /**
     * Create a new short link.
     */
    static async create(data) {
        return prisma_1.prisma.shortLink.create({
            data: {
                originalUrl: data.originalUrl,
                shortCode: data.shortCode,
                expiresAt: data.expiresAt,
                userId: data.userId,
            },
        });
    }
    /**
     * Record a click.
     */
    static async createClick(data) {
        return prisma_1.prisma.click.create({
            data: {
                shortLinkId: data.shortLinkId,
                ipAddress: data.ipAddress,
                userAgent: data.userAgent,
            },
        });
    }
    /**
     * Find a short link by its ID.
     */
    static async findById(id) {
        return prisma_1.prisma.shortLink.findUnique({
            where: {
                id,
            },
        });
    }
    /**
     * Find a short link owned by a specific user.
     */
    static async findByIdAndUserId(id, userId) {
        return prisma_1.prisma.shortLink.findFirst({
            where: {
                id,
                userId,
            },
        });
    }
    /**
     * Fetch all URLs belonging to a user.
     */
    static async findAllByUserId(userId) {
        return prisma_1.prisma.shortLink.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    /**
     * Delete a short link.
     */
    static async delete(id) {
        return prisma_1.prisma.shortLink.delete({
            where: {
                id,
            },
        });
    }
    /**
     * Count total clicks.
     */
    static async countClicks(shortLinkId) {
        return prisma_1.prisma.click.count({
            where: {
                shortLinkId,
            },
        });
    }
    /**
     * Fetch recent clicks.
     */
    static async findClicks(shortLinkId) {
        return prisma_1.prisma.click.findMany({
            where: {
                shortLinkId,
            },
            orderBy: {
                clickedAt: "desc",
            },
        });
    }
}
exports.UrlRepository = UrlRepository;
//# sourceMappingURL=repository.js.map