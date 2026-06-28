import { Request, Response, NextFunction } from "express";
import { HealthService } from "./service";

export class HealthController {
  static async check(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const response = await HealthService.check();

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}