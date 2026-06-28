import type {
  NextFunction,
  Request,
  Response,
} from "express";

import { ZodError } from "zod";

import { AppError } from "../errors/AppError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  /**
   * Zod Validation Errors
   */
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: error.flatten(),
    });

    return;
  }

  /**
   * Application Errors
   */
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  /**
   * Unknown Errors
   */
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal Server Error.",
  });
}