import { prisma } from "prisma/db";

export abstract class Public {
  static async getDiagnoses() {
    return prisma.diagnosis.findMany({
      select: { id: true, value: true, label: true },
    });
  }
}
