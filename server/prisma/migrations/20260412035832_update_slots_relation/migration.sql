-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "availabilityRuleId" TEXT,
    "clinicianId" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'FREE',
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "slot_availabilityRuleId_fkey" FOREIGN KEY ("availabilityRuleId") REFERENCES "schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "slot_clinicianId_fkey" FOREIGN KEY ("clinicianId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_slot" ("availabilityRuleId", "clinicianId", "createdAt", "endAt", "id", "isHidden", "startAt", "status", "updatedAt") SELECT "availabilityRuleId", "clinicianId", "createdAt", "endAt", "id", "isHidden", "startAt", "status", "updatedAt" FROM "slot";
DROP TABLE "slot";
ALTER TABLE "new_slot" RENAME TO "slot";
CREATE INDEX "slot_availabilityRuleId_idx" ON "slot"("availabilityRuleId");
CREATE INDEX "slot_clinicianId_idx" ON "slot"("clinicianId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
