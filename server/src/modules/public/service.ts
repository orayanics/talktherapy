import { prisma } from "@/lib/client";

export async function fetchAllDiagnoses() {
  const diagnoses = await prisma.diagnosis.findMany();
  return diagnoses;
}
