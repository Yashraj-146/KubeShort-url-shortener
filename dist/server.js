"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const logger_1 = require("./lib/logger");
const redis_1 = require("./lib/redis");
async function bootstrap() {
    try {
        /**
         * Connect to Redis.
         */
        await redis_1.redis.connect();
        logger_1.logger.info("✅ Connected to Redis");
        /**
         * Start the HTTP server.
         */
        app_1.default.listen(env_1.env.PORT, () => {
            logger_1.logger.info({
                port: env_1.env.PORT,
                environment: env_1.env.NODE_ENV,
            }, `🚀 Server is running at http://localhost:${env_1.env.PORT}`);
        });
    }
    catch (error) {
        logger_1.logger.error(error, "Failed to start server.");
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=server.js.map