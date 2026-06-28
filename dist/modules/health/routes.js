"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
exports.healthRouter = (0, express_1.Router)();
exports.healthRouter.get("/", controller_1.HealthController.check);
//# sourceMappingURL=routes.js.map