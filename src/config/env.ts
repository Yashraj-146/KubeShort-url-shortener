import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string(),

  LOG_LEVEL: z.string().default("info"),

  GOOGLE_CLIENT_ID: z.string().default(""),

  JWT_SECRET: z.string().min(32),

  JWT_EXPIRES_IN: z.string().default("7d"),
});

export const env = envSchema.parse(process.env);