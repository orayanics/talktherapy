import { prisma } from "./db";

async function permissionSeeder() {
  // permissions seeder
  const permissions = [
    { name: "users:create" },
    { name: "users:read" },
    { name: "users:update" },
    { name: "users:delete" },
    { name: "content:create" },
    { name: "content:read" },
    { name: "content:update" },
    { name: "content:delete" },
    { name: "system:maintenance" },
  ];

  const permissionRecords = await prisma.permissions.createMany({
    data: permissions,
  });

  console.log("Done permission seeder");
}

async function diagnosisSeeder() {
  // diagnosis seeder
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

  const diagnosisRecords = await prisma.diagnosis.createMany({
    data: diagnoses,
  });

  return diagnoses;
}

function getPermissionsByRole(role: string): string[] {
  const permissionMap: Record<string, string[]> = {
    sudo: [
      "users:create",
      "users:read",
      "users:update",
      "users:delete",
      "content:create",
      "content:read",
      "content:update",
      "content:delete",
      "system:maintenance",
    ],
    admin: ["users:read", "content:read"],
    clinician: ["content:read"],
    patient: ["content:read"],
  };

  return permissionMap[role] || [];
}

async function userSeeder() {
  const password = "admin123";
  const hashedPassword = await Bun.password.hash(password);

  // Get some diagnosis IDs for patients and clinicians
  const asdDiagnosis = await prisma.diagnosis.findFirst({
    where: { value: "ASD" },
  });
  const cpDiagnosis = await prisma.diagnosis.findFirst({
    where: { value: "CP" },
  });

  // SUDO
  const sudoUser = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "sudo@example.com",
      password: hashedPassword,
      account_status: "active",
      account_role: "sudo",
      account_permissions: getPermissionsByRole("sudo").join(","),
      sudo: {
        create: {},
      },
    },
  });
  const admin1 = await prisma.user.create({
    data: {
      name: "Admin One",
      email: "admin1@example.com",
      password: hashedPassword,
      account_status: "active",
      account_role: "admin",
      account_permissions: getPermissionsByRole("admin").join(","),
      admin: {
        create: {},
      },
    },
  });

  const clinician1 = await prisma.user.create({
    data: {
      name: "Dr. Jane Smith",
      email: "clinician1@example.com",
      password: hashedPassword,
      account_status: "active",
      account_role: "clinician",
      account_permissions: getPermissionsByRole("clinician").join(","),
      clinician: {
        create: {
          diagnosis_id: asdDiagnosis?.id,
        },
      },
    },
  });

  const patient1 = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "patient1@example.com",
      password: hashedPassword,
      account_status: "active",
      account_role: "patient",
      account_permissions: getPermissionsByRole("patient").join(","),
      patient: {
        create: {
          diagnosis_id: cpDiagnosis?.id,
          consent: true,
        },
      },
    },
  });
}

async function main() {}
console.log("🌱 Starting seed...\n");
console.log("\n");

// delete existing data
await prisma.permissions.deleteMany();
await prisma.diagnosis.deleteMany();
await prisma.user.deleteMany();

await permissionSeeder();
await diagnosisSeeder();
await userSeeder();

console.log("\n");
console.log("✅ Seed completed successfully!");

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
