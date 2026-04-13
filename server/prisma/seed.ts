import { prisma } from "@/lib/client";

async function seedSuperadmin() {
  const email = "admin@yourapp.com";

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log("Superadmin already exists");
    return;
  }

  const hashedPassword = await Bun.password.hash("Admin123!");

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email,
      name: "Super Admin",
      emailVerified: true,
      role: "superadmin",
      banned: false,
      status: "active",
    },
  });

  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: hashedPassword,
    },
  });

  console.log("✅ Superadmin created:", user.email);
}

async function seedDiagnoses() {
  const diagnoses = [
    { value: "ASD", label: "Autism Spectrum Disorder" },
    { value: "ADHD", label: "Attention-Deficit Hyperactivity Disorder" },
    { value: "GDD", label: "Global Developmental Delay" },
    { value: "CP", label: "Cerebral Palsy" },
    { value: "DS", label: "Down Syndrome" },
    { value: "HI", label: "Hearing Impairment" },
    { value: "CLP", label: "Cleft Lip and/or Palate" },
    { value: "STR", label: "Stroke" },
    { value: "STUT", label: "Stuttering" },
    { value: "APH", label: "Aphasia" },
    { value: "OTH", label: "Others" },
  ];

  await prisma.diagnosis.createMany({
    data: diagnoses.map((d) => ({
      id: crypto.randomUUID(),
      value: d.value,
      label: d.label,
    })),
  });

  console.log("✅ Diagnoses seeded");
}

async function main() {
  console.log("🌱 Starting seed...\n");
  await seedDiagnoses();
  await seedSuperadmin();
  console.log("\n✅ Seed completed");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
