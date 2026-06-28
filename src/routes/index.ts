import { Router } from "express";

import { authRouter } from "../modules/auth";
import { healthRouter } from "../modules/health";
import { urlRouter } from "../modules/url";

export const apiRouter = Router();

/**
 * Health Routes
 */
apiRouter.use("/health", healthRouter);

/**
 * Authentication Routes
 */
apiRouter.use("/auth", authRouter);

/**
 * URL Routes
 */
apiRouter.use("/urls", urlRouter);