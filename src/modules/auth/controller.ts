import type { NextFunction, Request, Response } from "express";

import { googleAuthSchema } from "./schema";
import { AuthService } from "./service";

export class AuthController {
  static async googleLogin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      /**
       * Validate request body
       */
      const request = googleAuthSchema.parse(req.body);

      /**
       * Authenticate user
       */
      const response = await AuthService.authenticateWithGoogle(request);

      /**
       * Return response
       */
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}