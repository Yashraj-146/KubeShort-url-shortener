import { z } from "zod";

export const createShortUrlSchema = z.object({
  originalUrl: z.url({
    error: "Please provide a valid URL.",
  }),

  customAlias: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message:
        "Custom alias may contain only letters, numbers, hyphens and underscores.",
    })
    .optional(),

  expiresAt: z
    .string()
    .datetime()
    .optional(),
});

export type CreateShortUrlRequest = z.infer<
  typeof createShortUrlSchema
>;