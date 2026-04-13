/*
  Warnings:

  - A unique constraint covering the columns `[clinicianId,patientId]` on the table `clinician_patient` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "availabilityRuleId" TEXT,
    "clinicianId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "slot_availabilityRuleId_fkey" FOREIGN KEY ("availabilityRuleId") REFERENCES "schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT,
    "patientId" TEXT NOT NULL,
    "clinicianId" TEXT,
    "status" TEXT,
    "bookedAt" DATETIME,
    "confirmedAt" DATETIME,
    "cancelledAt" DATETIME,
    "completedAt" DATETIME,
    "rescheduledAt" DATETIME,
    "roomId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointment_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "slot" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_appointment" ("bookedAt", "cancelledAt", "clinicianId", "completedAt", "confirmedAt", "createdAt", "id", "patientId", "rescheduledAt", "roomId", "slotId", "status", "updatedAt") SELECT "bookedAt", "cancelledAt", "clinicianId", "completedAt", "confirmedAt", "createdAt", "id", "patientId", "rescheduledAt", "roomId", "slotId", "status", "updatedAt" FROM "appointment";
DROP TABLE "appointment";
ALTER TABLE "new_appointment" RENAME TO "appointment";
CREATE INDEX "appointment_patientId_idx" ON "appointment"("patientId");
CREATE INDEX "appointment_clinicianId_idx" ON "appointment"("clinicianId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "slot_availabilityRuleId_idx" ON "slot"("availabilityRuleId");

-- CreateIndex
CREATE INDEX "slot_clinicianId_idx" ON "slot"("clinicianId");

-- CreateIndex
CREATE UNIQUE INDEX "clinician_patient_clinicianId_patientId_key" ON "clinician_patient"("clinicianId", "patientId");
