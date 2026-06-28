import { prisma } from "../../lib/prisma";

interface CreateGoogleUserInput {
  email: string;
  googleId: string;
  name?: string;
  avatarUrl?: string;
}

export class AuthRepository {
  static async findByGoogleId(googleId: string) {
    return prisma.user.findUnique({
      where: {
        googleId,
      },
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  static async createGoogleUser(data: CreateGoogleUserInput) {
    return prisma.user.create({
      data,
    });
  }

  static async updateGoogleUser(
    id: string,
    data: Partial<CreateGoogleUserInput>
  ) {
    return prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }
}