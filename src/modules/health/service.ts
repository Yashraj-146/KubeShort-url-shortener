import { prisma } from "../../lib/prisma";
import { HEALTH_STATUS } from "./constants";
import type { HealthResponse } from "./types";

export class HealthService {
  static async check(): Promise<HealthResponse> {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: HEALTH_STATUS.OK,
      database: "connected",
      timestamp: new Date().toISOString(),
    };
  }
}