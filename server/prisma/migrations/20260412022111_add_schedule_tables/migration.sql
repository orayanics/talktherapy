-- CreateTable
CREATE TABLE "appointment" (
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
    CONSTRAINT "appointment_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "type" TEXT,
    "actorType" TEXT,
    "actorId" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "events_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicianId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "recurrenceRule" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "schedules_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clinician_patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clinicianId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "firstCompletedAt" DATETIME,
    CONSTRAINT "clinician_patient_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "clinician_patient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Encounter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT NOT NULL,
    "diagnosis" TEXT,
    "chiefComplaint" TEXT,
    "referralSource" TEXT,
    "referralUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Encounter_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "appointment_patientId_idx" ON "appointment"("patientId");

-- CreateIndex
CREATE INDEX "appointment_clinicianId_idx" ON "appointment"("clinicianId");

-- CreateIndex
CREATE INDEX "events_appointmentId_idx" ON "events"("appointmentId");

-- CreateIndex
CREATE INDEX "schedules_clinicianId_idx" ON "schedules"("clinicianId");

-- CreateIndex
CREATE UNIQUE INDEX "Encounter_appointmentId_key" ON "Encounter"("appointmentId");

-- CreateIndex
CREATE INDEX "Encounter_appointmentId_idx" ON "Encounter"("appointmentId");
