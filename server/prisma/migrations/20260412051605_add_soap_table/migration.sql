-- CreateTable
CREATE TABLE "soaps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicianId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "activity_plan" TEXT NOT NULL,
    "session_type" TEXT,
    "subjective_notes" TEXT,
    "objective_notes" TEXT,
    "assessment" TEXT,
    "recommendation" TEXT,
    "comments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "soaps_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "soaps_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
