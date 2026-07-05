import app from "./app";

import { env } from "./config/env";

import { logger } from "./lib/logger";
import { redis } from "./lib/redis";

async function bootstrap(): Promise<void> {
  try {
    /**
     * Connect to Redis.
     */
    await redis.connect();

    logger.info("✅ Connected to Redis");

    /**
     * Start the HTTP server.
     */
    app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
        },
        `🚀 Server is running at http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    logger.error(error, "Failed to start server.");

    process.exit(1);
  }
}

bootstrap();