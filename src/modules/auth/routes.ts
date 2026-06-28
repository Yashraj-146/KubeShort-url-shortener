import { Router } from "express";

import { AuthController } from "./controller";

export const authRouter = Router();

/**
 * =====================================
 * Google Authentication
 * =====================================
 */
authRouter.post("/google", AuthController.googleLogin);