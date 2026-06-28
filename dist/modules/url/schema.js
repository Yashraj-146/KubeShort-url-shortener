"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShortUrlSchema = void 0;
const zod_1 = require("zod");
exports.createShortUrlSchema = zod_1.z.object({
    originalUrl: zod_1.z.url({
        error: "Please provide a valid URL.",
    }),
    customAlias: zod_1.z
        .string()
        .trim()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_-]+$/, {
        message: "Custom alias may contain only letters, numbers, hyphens and underscores.",
    })
        .optional(),
    expiresAt: zod_1.z
        .string()
        .datetime()
        .optional(),
});
//# sourceMappingURL=schema.js.map