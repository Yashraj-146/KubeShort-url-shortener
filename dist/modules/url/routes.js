"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const rate_limit_1 = require("../../middleware/rate-limit");
const controller_1 = require("./controller");
exports.urlRouter = (0, express_1.Router)();
/**
 * Create Short URL
 */
exports.urlRouter.post("/", rate_limit_1.createUrlLimiter, auth_1.authenticate, controller_1.UrlController.createShortUrl);
/**
 * List User URLs
 */
exports.urlRouter.get("/", auth_1.authenticate, controller_1.UrlController.listUrls);
/**
 * Get URL Details
 */
exports.urlRouter.get("/:id", auth_1.authenticate, controller_1.UrlController.getUrl);
/**
 * Delete URL
 */
exports.urlRouter.delete("/:id", auth_1.authenticate, controller_1.UrlController.deleteUrl);
/**
 * URL Analytics
 */
exports.urlRouter.get("/:id/analytics", rate_limit_1.analyticsLimiter, auth_1.authenticate, controller_1.UrlController.getAnalytics);
//# sourceMappingURL=routes.js.map