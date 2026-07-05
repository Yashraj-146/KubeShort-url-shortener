import { Router } from "express";

import { authenticate } from "../../middleware/auth";
import {
  analyticsLimiter,
  createUrlLimiter,
} from "../../middleware/rate-limit";

import { UrlController } from "./controller";

export const urlRouter = Router();

/**
 * Create Short URL
 */
urlRouter.post(
  "/",
  createUrlLimiter,
  authenticate,
  UrlController.createShortUrl
);

/**
 * List User URLs
 */
urlRouter.get(
  "/",
  authenticate,
  UrlController.listUrls
);

/**
 * Get URL Details
 */
urlRouter.get(
  "/:id",
  authenticate,
  UrlController.getUrl
);

/**
 * Delete URL
 */
urlRouter.delete(
  "/:id",
  authenticate,
  UrlController.deleteUrl
);

/**
 * URL Analytics
 */
urlRouter.get(
  "/:id/analytics",
  analyticsLimiter,
  authenticate,
  UrlController.getAnalytics
);