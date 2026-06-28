"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const health_1 = require("../modules/health");
const auth_1 = require("../modules/auth");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use("/health", health_1.healthRouter);
exports.apiRouter.use("/auth", auth_1.authRouter);
//# sourceMappingURL=index.js.map