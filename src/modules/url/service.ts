import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { redis } from "../../lib/redis";
import { generateShortCode } from "../../utils/generateShortCode";

import {
  SHORT_CODE_LENGTH,
  URL_CACHE_PREFIX,
  URL_CACHE_TTL,
} from "./constants";

import { UrlRepository } from "./repository";

import type {
  CreateShortLinkDto,
  RedirectDto,
  RedirectResult,
  ShortLinkResponse,
} from "./types";

interface CachedShortLink {
  id: string;
  originalUrl: string;
  expiresAt: string | null;
}

export class UrlService {
  /**
   * Create a new short URL.
   */
  static async createShortUrl(
    data: CreateShortLinkDto
  ): Promise<ShortLinkResponse> {
    let shortCode: string;

    if (data.customAlias) {
      const existing =
        await UrlRepository.findByCustomAlias(
          data.customAlias
        );

      if (existing) {
        throw new AppError(
          "Custom alias already exists.",
          409
        );
      }

      shortCode = data.customAlias;
    } else {
      do {
        shortCode = generateShortCode(
          SHORT_CODE_LENGTH
        );
      } while (
        await UrlRepository.findByShortCode(
          shortCode
        )
      );
    }

    const shortLink =
      await UrlRepository.create({
        ...data,
        shortCode,
      });

    return {
      id: shortLink.id,
      originalUrl: shortLink.originalUrl,
      shortCode: shortLink.shortCode,
      shortUrl: `${env.BASE_URL}/${shortLink.shortCode}`,
      expiresAt: shortLink.expiresAt,
      createdAt: shortLink.createdAt,
    };
  }

  /**
   * Resolve a short URL.
   * Uses Redis when REDIS_CACHE_ENABLED=true.
   */
  static async redirect(
    data: RedirectDto
  ): Promise<RedirectResult> {
    const cacheKey =
      `${URL_CACHE_PREFIX}${data.shortCode}`;

    /**
     * Attempt Redis lookup only when cache is enabled.
     */
    if (env.REDIS_CACHE_ENABLED) {
      const cached = await redis.get(cacheKey);

      if (cached) {
        console.log(
          `🟢 Redis Cache HIT: ${data.shortCode}`
        );

        const shortLink =
          JSON.parse(cached) as CachedShortLink;

        if (
          shortLink.expiresAt &&
          new Date(shortLink.expiresAt) < new Date()
        ) {
          throw new AppError(
            "This short URL has expired.",
            410
          );
        }

        if (!env.BENCHMARK_MODE) {
          await UrlRepository.createClick({
            shortLinkId: shortLink.id,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
          });
        }

        return {
          originalUrl: shortLink.originalUrl,
        };
      }

      console.log(
        `🔴 Redis Cache MISS: ${data.shortCode}`
      );
    }

    /**
     * Fetch from PostgreSQL.
     */
    const shortLink =
      await UrlRepository.findByShortCode(
        data.shortCode
      );

    if (!shortLink) {
      throw new AppError(
        "Short URL not found.",
        404
      );
    }

    if (
      shortLink.expiresAt &&
      shortLink.expiresAt < new Date()
    ) {
      throw new AppError(
        "This short URL has expired.",
        410
      );
    }

    /**
     * Store in Redis only when cache is enabled.
     */
    if (env.REDIS_CACHE_ENABLED) {
      await redis.set(
        cacheKey,
        JSON.stringify({
          id: shortLink.id,
          originalUrl: shortLink.originalUrl,
          expiresAt: shortLink.expiresAt,
        }),
        {
          EX: URL_CACHE_TTL,
        }
      );
    }

    /**
     * Record click.
     */
    if (!env.BENCHMARK_MODE) {
      await UrlRepository.createClick({
        shortLinkId: shortLink.id,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      });
    }

    return {
      originalUrl: shortLink.originalUrl,
    };
  }

  /**
   * List all URLs.
   */
  static async listUserUrls(userId: string) {
    return UrlRepository.findAllByUserId(userId);
  }

  /**
   * Get URL details.
   */
  static async getUrl(
    id: string,
    userId: string
  ) {
    const shortLink =
      await UrlRepository.findByIdAndUserId(
        id,
        userId
      );

    if (!shortLink) {
      throw new AppError(
        "Short URL not found.",
        404
      );
    }

    const totalClicks =
      await UrlRepository.countClicks(
        shortLink.id
      );

    return {
      ...shortLink,
      totalClicks,
    };
  }

  /**
   * Delete URL.
   */
  static async deleteUrl(
    id: string,
    userId: string
  ) {
    const shortLink =
      await UrlRepository.findByIdAndUserId(
        id,
        userId
      );

    if (!shortLink) {
      throw new AppError(
        "Short URL not found.",
        404
      );
    }

    /**
     * Remove from Redis only when cache is enabled.
     */
    if (env.REDIS_CACHE_ENABLED) {
      await redis.del(
        `${URL_CACHE_PREFIX}${shortLink.shortCode}`
      );
    }

    await UrlRepository.delete(
      shortLink.id
    );
  }

  /**
   * URL analytics.
   */
  static async getAnalytics(
    id: string,
    userId: string
  ) {
    const shortLink =
      await UrlRepository.findByIdAndUserId(
        id,
        userId
      );

    if (!shortLink) {
      throw new AppError(
        "Short URL not found.",
        404
      );
    }

    const totalClicks =
      await UrlRepository.countClicks(
        shortLink.id
      );

    const recentClicks =
      await UrlRepository.findClicks(
        shortLink.id
      );

    return {
      shortLink,
      totalClicks,
      recentClicks,
    };
  }
}