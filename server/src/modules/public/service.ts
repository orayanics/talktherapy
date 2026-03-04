import { prisma } from "prisma/db";

export abstract class Public {
  static async getDiagnoses() {
    const diagnoses = await prisma.diagnosis.findMany({
      select: { id: true, value: true, label: true },
    });
    return { data: diagnoses };
  }
}
