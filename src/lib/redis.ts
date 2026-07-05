import { createClient } from "redis";

import { env } from "../config/env";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (error) => {
  console.error("Redis Error:", error);
});