"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.verifyAccessToken = verifyAccessToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: "7d",
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
}
// import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
// import { env } from "../config/env";
// import type { JwtPayload } from "../modules/auth/types";
// const JWT_SECRET: Secret = env.JWT_SECRET;
// const JWT_OPTIONS: SignOptions = {
//   expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
// };
// export function generateAccessToken(payload: JwtPayload): string {
//   return jwt.sign(payload, JWT_SECRET, JWT_OPTIONS);
// }
// export function verifyAccessToken(token: string): JwtPayload {
//   return jwt.verify(token, JWT_SECRET) as JwtPayload;
// }
//# sourceMappingURL=jwt.js.map