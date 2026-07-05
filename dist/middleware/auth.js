"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_1 = require("../lib/jwt");
const AppError_1 = require("../errors/AppError");
async function authenticate(req, _res, next) {
    try {
        const authorization = req.headers.authorization;
        if (!authorization) {
            throw new AppError_1.AppError("Authorization header is missing.", 401);
        }
        const [scheme, token] = authorization.split(" ");
        if (scheme !== "Bearer" || !token) {
            throw new AppError_1.AppError("Invalid authorization header.", 401);
        }
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        /**
         * Invalid or expired JWT.
         */
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return next(new AppError_1.AppError("Invalid or expired access token.", 401));
        }
        next(error);
    }
}
//# sourceMappingURL=auth.js.map