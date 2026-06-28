"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const prisma_1 = require("../../lib/prisma");
class AuthRepository {
    static async findByGoogleId(googleId) {
        return prisma_1.prisma.user.findUnique({
            where: {
                googleId,
            },
        });
    }
    static async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }
    static async createGoogleUser(data) {
        return prisma_1.prisma.user.create({
            data,
        });
    }
    static async updateGoogleUser(id, data) {
        return prisma_1.prisma.user.update({
            where: {
                id,
            },
            data,
        });
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=repository.js.map