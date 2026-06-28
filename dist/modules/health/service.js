"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthService = void 0;
const prisma_1 = require("../../lib/prisma");
const constants_1 = require("./constants");
class HealthService {
    static async check() {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        return {
            status: constants_1.HEALTH_STATUS.OK,
            database: "connected",
            timestamp: new Date().toISOString(),
        };
    }
}
exports.HealthService = HealthService;
//# sourceMappingURL=service.js.map