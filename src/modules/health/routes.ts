import { Router } from "express";
import { HealthController } from "./controller";

export const healthRouter = Router();

healthRouter.get("/", HealthController.check);