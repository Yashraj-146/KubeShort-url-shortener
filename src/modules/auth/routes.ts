import { Router } from "express";

import { authLimiter } from "../../middleware/rate-limit";

import { AuthController } from "./controller";

export const authRouter = Router();

/**
 * Google OAuth Login
 */
authRouter.post(
  "/google",
  authLimiter,
  AuthController.googleLogin);