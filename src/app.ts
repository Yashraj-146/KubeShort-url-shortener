import express from "express";
import cors from "cors";
import helmet from "helmet";

import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/error-handler";
import { UrlController } from "./modules/url/controller";
import { redirectLimiter } from "./middleware/rate-limit";

const app = express();

/**
 * =====================================
 * Global Middleware
 * =====================================
 */

// Security headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

/**
 * =====================================
 * Root Endpoint
 * =====================================
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    name: "URL Shortener API",
    version: "1.0.0",
    status: "running",
  });
});

/**
 * Public redirect endpoint.
 */
app.get(
  "/:shortCode",
  redirectLimiter,
  UrlController.redirect
);

/**
 * =====================================
 * API Routes
 * =====================================
 */
app.use("/api/v1", apiRouter);

/**
 * =====================================
 * 404 Handler
 * =====================================
 */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

/**
 * =====================================
 * Global Error Handler
 * =====================================
 */
app.use(errorHandler);

export default app;