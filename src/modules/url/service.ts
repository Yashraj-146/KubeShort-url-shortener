import { env } from "../../config/env";
import { AppError } from "../../errors/AppError";
import { generateShortCode } from "../../utils/generateShortCode";

import { UrlRepository } from "./repository";

import type {
  CreateShortLinkDto,
  ShortLinkResponse,
  RedirectDto,
  RedirectResult,
} from "./types";

export class UrlService {
  /**
   * Create a new short URL.
   */
  static async createShortUrl(
    data: CreateShortLinkDto
  ): Promise<ShortLinkResponse> {
    let shortCode: string;

    /**
     * Use custom alias if provided.
     */
    if (data.customAlias) {
      const existing = await UrlRepository.findByCustomAlias(
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
      /**
       * Generate a unique random short code.
       */
      do {
        shortCode = generateShortCode(7);
      } while (
        await UrlRepository.findByShortCode(shortCode)
      );
    }

    /**
     * Persist the URL.
     */
    const shortLink = await UrlRepository.create({
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
   * Resolve a short URL and record the click.
   */
  static async redirect(
    data: RedirectDto
  ): Promise<RedirectResult> {
    const shortLink = await UrlRepository.findByShortCode(
      data.shortCode
    );

    if (!shortLink) {
      throw new AppError("Short URL not found.", 404);
    }

    /**
     * Check whether the link has expired.
     */
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
     * Record the click.
     */
    await UrlRepository.createClick({
      shortLinkId: shortLink.id,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });

    return {
      originalUrl: shortLink.originalUrl,
    };
  }
}