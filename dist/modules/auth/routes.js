"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
exports.authRouter = (0, express_1.Router)();
/**
 * =====================================
 * Google Authentication
 * =====================================
 */
exports.authRouter.post("/google", controller_1.AuthController.googleLogin);
//# sourceMappingURL=routes.js.map