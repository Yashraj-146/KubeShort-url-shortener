"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const env_1 = require("../../config/env");
const google_1 = require("../../lib/google");
const jwt_1 = require("../../lib/jwt");
const AppError_1 = require("../../errors/AppError");
const repository_1 = require("./repository");
class AuthService {
    static async authenticateWithGoogle(request) {
        /**
         * Ensure Google OAuth is configured.
         */
        if (!env_1.env.GOOGLE_CLIENT_ID) {
            throw new AppError_1.AppError("Google OAuth is not configured.", 500);
        }
        /**
         * Verify Google ID token.
         */
        const ticket = await google_1.googleClient.verifyIdToken({
            idToken: request.idToken,
            audience: env_1.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            throw new AppError_1.AppError("Invalid Google ID token.", 401);
        }
        const { sub: googleId, email, name, picture, } = payload;
        if (!email) {
            throw new AppError_1.AppError("Google account does not have an email address.", 400);
        }
        /**
         * Try finding the user using Google ID.
         */
        let user = await repository_1.AuthRepository.findByGoogleId(googleId);
        if (user) {
            /**
             * Existing Google user.
             * Update profile information.
             */
            user = await repository_1.AuthRepository.updateGoogleUser(user.id, {
                name,
                avatarUrl: picture,
            });
        }
        else {
            /**
             * Check if the email already exists.
             */
            user = await repository_1.AuthRepository.findByEmail(email);
            if (user) {
                /**
                 * Existing email.
                 * Link Google account.
                 */
                user = await repository_1.AuthRepository.updateGoogleUser(user.id, {
                    googleId,
                    name,
                    avatarUrl: picture,
                });
            }
            else {
                /**
                 * First-time login.
                 * Create a new user.
                 */
                user = await repository_1.AuthRepository.createGoogleUser({
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
        const accessToken = (0, jwt_1.generateAccessToken)({
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
exports.AuthService = AuthService;
//# sourceMappingURL=service.js.map