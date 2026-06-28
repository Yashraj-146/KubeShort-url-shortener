"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: zod_1.z.coerce.number().default(3000),
    BASE_URL: zod_1.z.url(),
    DATABASE_URL: zod_1.z.string(),
    LOG_LEVEL: zod_1.z.string().default("info"),
    GOOGLE_CLIENT_ID: zod_1.z.string().default(""),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default("7d"),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map