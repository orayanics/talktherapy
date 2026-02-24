-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Slot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "availability_rule_id" TEXT NOT NULL,
    "clinician_id" TEXT NOT NULL,
    "starts_at" DATETIME NOT NULL,
    "ends_at" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Slot_clinician_id_fkey" FOREIGN KEY ("clinician_id") REFERENCES "Clinician" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Slot_availability_rule_id_fkey" FOREIGN KEY ("availability_rule_id") REFERENCES "AvailabilityRule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Slot" ("availability_rule_id", "clinician_id", "created_at", "ends_at", "id", "starts_at", "status", "updated_at") SELECT "availability_rule_id", "clinician_id", "created_at", "ends_at", "id", "starts_at", "status", "updated_at" FROM "Slot";
DROP TABLE "Slot";
ALTER TABLE "new_Slot" RENAME TO "Slot";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
