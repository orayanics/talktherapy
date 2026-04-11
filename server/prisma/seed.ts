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

async function main() {
  console.log("🌱 Starting seed...\n");
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
