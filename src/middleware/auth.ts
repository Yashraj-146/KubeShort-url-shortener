import type { NextFunction, Request, Response } from "express";

import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../lib/jwt";
import { AppError } from "../errors/AppError";

import type { JwtPayload } from "../modules/auth/types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(
        "Authorization header is missing.",
        401
      );
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError(
        "Invalid authorization header.",
        401
      );
    }

    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch (error) {
    /**
     * Invalid or expired JWT.
     */
    if (error instanceof jwt.JsonWebTokenError) {
      return next(
        new AppError(
          "Invalid or expired access token.",
          401
        )
      );
    }

    next(error);
  }
}