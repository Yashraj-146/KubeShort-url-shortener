"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../modules/auth");
const health_1 = require("../modules/health");
const url_1 = require("../modules/url");
exports.apiRouter = (0, express_1.Router)();
/**
 * Health Routes
 */
exports.apiRouter.use("/health", health_1.healthRouter);
/**
 * Authentication Routes
 */
exports.apiRouter.use("/auth", auth_1.authRouter);
/**
 * URL Routes
 */
exports.apiRouter.use("/urls", url_1.urlRouter);
//# sourceMappingURL=index.js.map