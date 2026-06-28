import { env } from "../../config/env";

import { googleClient } from "../../lib/google";
import { generateAccessToken } from "../../lib/jwt";

import { AppError } from "../../errors/AppError";

import { AuthRepository } from "./repository";

import type {
  AuthResponse,
  GoogleAuthRequest,
} from "./types";

export class AuthService {
  static async authenticateWithGoogle(
    request: GoogleAuthRequest
  ): Promise<AuthResponse> {

    /**
     * Ensure Google OAuth is configured.
     */
    if (!env.GOOGLE_CLIENT_ID) {
      throw new AppError(
        "Google OAuth is not configured.",
        500
      );
    }

    /**
     * Verify Google ID token.
     */
    const ticket = await googleClient.verifyIdToken({
      idToken: request.idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new AppError(
        "Invalid Google ID token.",
        401
      );
    }

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    if (!email) {
      throw new AppError(
        "Google account does not have an email address.",
        400
      );
    }

    /**
     * Try finding the user using Google ID.
     */
    let user = await AuthRepository.findByGoogleId(googleId);

    if (user) {
      /**
       * Existing Google user.
       * Update profile information.
       */
      user = await AuthRepository.updateGoogleUser(user.id, {
        name,
        avatarUrl: picture,
      });
    } else {
      /**
       * Check if the email already exists.
       */
      user = await AuthRepository.findByEmail(email);

      if (user) {
        /**
         * Existing email.
         * Link Google account.
         */
        user = await AuthRepository.updateGoogleUser(user.id, {
          googleId,
          name,
          avatarUrl: picture,
        });
      } else {
        /**
         * First-time login.
         * Create a new user.
         */
        user = await AuthRepository.createGoogleUser({
          email,
          googleId,
          name,
          avatarUrl: picture,
        });
      }
    }

    /**
     * Generate our application's JWT.
     */
    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}