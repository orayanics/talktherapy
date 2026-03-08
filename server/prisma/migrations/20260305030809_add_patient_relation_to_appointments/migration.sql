-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slot_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "booked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" DATETIME,
    "cancelled_at" DATETIME,
    "completed_at" DATETIME,
    "rescheduled_at" DATETIME,
    "room_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Appointments_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "Slot" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Appointments" ("booked_at", "cancelled_at", "completed_at", "confirmed_at", "created_at", "id", "patient_id", "rescheduled_at", "room_id", "slot_id", "status", "updated_at") SELECT "booked_at", "cancelled_at", "completed_at", "confirmed_at", "created_at", "id", "patient_id", "rescheduled_at", "room_id", "slot_id", "status", "updated_at" FROM "Appointments";
DROP TABLE "Appointments";
ALTER TABLE "new_Appointments" RENAME TO "Appointments";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
