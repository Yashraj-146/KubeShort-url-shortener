import { prisma } from "../../lib/prisma";

import type { CreateShortLinkDto } from "./types";

export class UrlRepository {
  /**
   * Find a short link by its short code.
   */
  static async findByShortCode(shortCode: string) {
    return prisma.shortLink.findUnique({
      where: {
        shortCode,
      },
    });
  }

  /**
   * Find a short link by custom alias.
   */
  static async findByCustomAlias(customAlias: string) {
    return prisma.shortLink.findUnique({
      where: {
        shortCode: customAlias,
      },
    });
  }

  /**
   * Create a new short link.
   */
  static async create(
    data: CreateShortLinkDto & { shortCode: string }
  ) {
    return prisma.shortLink.create({
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
  static async createClick(data: {
    shortLinkId: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.click.create({
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
  static async findById(id: string) {
    return prisma.shortLink.findUnique({
      where: {
        id,
      },
    });
  }

  /**
   * Find a short link owned by a specific user.
   */
  static async findByIdAndUserId(
    id: string,
    userId: string
  ) {
    return prisma.shortLink.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  /**
   * Fetch all URLs belonging to a user.
   */
  static async findAllByUserId(userId: string) {
    return prisma.shortLink.findMany({
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
  static async delete(id: string) {
    return prisma.shortLink.delete({
      where: {
        id,
      },
    });
  }

  /**
   * Count total clicks.
   */
  static async countClicks(shortLinkId: string) {
    return prisma.click.count({
      where: {
        shortLinkId,
      },
    });
  }

  /**
   * Fetch recent clicks.
   */
  static async findClicks(shortLinkId: string) {
    return prisma.click.findMany({
      where: {
        shortLinkId,
      },
      orderBy: {
        clickedAt: "desc",
      },
    });
  }
}