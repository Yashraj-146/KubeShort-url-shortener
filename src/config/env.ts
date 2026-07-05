import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  BASE_URL: z.url(),
  
  DATABASE_URL: z.string(),

  REDIS_URL: z.url(),

  REDIS_CACHE_ENABLED: z
  .string()
  .transform((value) => value === "true"),

  BENCHMARK_MODE: z
  .string()
  .transform((value) => value === "true"),

  LOG_LEVEL: z.string().default("info"),

  GOOGLE_CLIENT_ID: z.string().default(""),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default("7d"),
});

export const env = envSchema.parse(process.env);