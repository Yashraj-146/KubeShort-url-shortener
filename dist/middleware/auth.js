"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
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
        next(error);
    }
}
//# sourceMappingURL=auth.js.map