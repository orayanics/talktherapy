import { status } from "elysia";
import { prisma } from "prisma/db";

export abstract class Users {
  static async getAllUsers() {
    const users = await prisma.user.findMany({
      omit: {
        password: true,
      },
    });
    return users;
  }
}
