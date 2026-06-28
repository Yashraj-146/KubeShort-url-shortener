"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const service_1 = require("./service");
class HealthController {
    static async check(_req, res, next) {
        try {
            const response = await service_1.HealthService.check();
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.HealthController = HealthController;
//# sourceMappingURL=controller.js.map