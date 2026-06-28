import jwt from "jsonwebtoken";

import { env } from "../config/env";
import type { JwtPayload } from "../modules/auth/types";

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
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