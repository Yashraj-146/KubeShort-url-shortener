"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const controller_1 = require("./controller");
exports.urlRouter = (0, express_1.Router)();
/**
 * =====================================
 * Create Short URL
 * =====================================
 */
exports.urlRouter.post("/", auth_1.authenticate, controller_1.UrlController.createShortUrl);
//# sourceMappingURL=routes.js.map