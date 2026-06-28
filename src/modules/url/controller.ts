import type { NextFunction, Request, Response } from "express";

import { AppError } from "../../errors/AppError";

import { createShortUrlSchema } from "./schema";
import { UrlService } from "./service";

export class UrlController {
  /**
   * Create a new short URL.
   */
  static async createShortUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * Validate request body.
       */
      const request = createShortUrlSchema.parse(req.body);

      /**
       * Ensure the user is authenticated.
       */
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      /**
       * Create the short URL.
       */
      const shortLink = await UrlService.createShortUrl({
        originalUrl: request.originalUrl,
        customAlias: request.customAlias,
        expiresAt: request.expiresAt
          ? new Date(request.expiresAt)
          : undefined,
        userId: req.user.sub,
      });

      res.status(201).json(shortLink);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Redirect to the original URL.
   */
  static async redirect(
  req: Request<{ shortCode: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
    try {
      const result = await UrlService.redirect({
        shortCode: req.params.shortCode,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      });

      res.redirect(302, result.originalUrl);
    } catch (error) {
      next(error);
    }
  }
}