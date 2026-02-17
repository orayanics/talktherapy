import { status } from "elysia";
import { prisma } from "prisma/db";

export abstract class Public {
  static async getDiagnoses() {
    const diagnoses = await prisma.diagnosis.findMany({
      omit: {
        created_at: true,
      },
    });
    return diagnoses;
  }
}
