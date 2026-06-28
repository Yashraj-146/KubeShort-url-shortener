import { Router } from "express";

import { authenticate } from "../../middleware/auth";
import { UrlController } from "./controller";

export const urlRouter = Router();

/**
 * Create a short URL.
 */
urlRouter.post(
  "/",
  authenticate,
  UrlController.createShortUrl
);