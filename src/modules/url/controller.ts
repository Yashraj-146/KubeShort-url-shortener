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
      const request = createShortUrlSchema.parse(req.body);

      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

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
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const shortCode = Array.isArray(req.params.shortCode)
        ? req.params.shortCode[0]
        : req.params.shortCode;

      const result = await UrlService.redirect({
        shortCode,
        ipAddress: req.ip,
        userAgent: req.get("user-agent") ?? undefined,
      });

      res.redirect(302, result.originalUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all URLs created by the authenticated user.
   */
  static async listUrls(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const urls = await UrlService.listUserUrls(req.user.sub);

      res.status(200).json(urls);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single URL.
   */
  static async getUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const url = await UrlService.getUrl(
        id,
        req.user.sub
      );

      res.status(200).json(url);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a URL.
   */
  static async deleteUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      await UrlService.deleteUrl(
        id,
        req.user.sub
      );

      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get URL analytics.
   */
  static async getAnalytics(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized.", 401);
      }

      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const analytics = await UrlService.getAnalytics(
        id,
        req.user.sub
      );

      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }
}