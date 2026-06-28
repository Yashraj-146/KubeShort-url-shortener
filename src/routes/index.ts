import { Router } from "express";

import { healthRouter } from "../modules/health";
import { authRouter } from "../modules/auth";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);