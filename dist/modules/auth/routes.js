"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const rate_limit_1 = require("../../middleware/rate-limit");
const controller_1 = require("./controller");
exports.authRouter = (0, express_1.Router)();
/**
 * Google OAuth Login
 */
exports.authRouter.post("/google", rate_limit_1.authLimiter, controller_1.AuthController.googleLogin);
//# sourceMappingURL=routes.js.map