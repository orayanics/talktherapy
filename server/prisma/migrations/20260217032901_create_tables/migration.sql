-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Clinician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "diagnosis_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Clinician_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Clinician_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "Diagnosis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Clinician" ("created_at", "diagnosis_id", "id", "updated_at", "user_id") SELECT "created_at", "diagnosis_id", "id", "updated_at", "user_id" FROM "Clinician";
DROP TABLE "Clinician";
ALTER TABLE "new_Clinician" RENAME TO "Clinician";
CREATE UNIQUE INDEX "Clinician_user_id_key" ON "Clinician"("user_id");
CREATE TABLE "new_Patient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "diagnosis_id" TEXT,
    "consent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "Patient_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Patient_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "Diagnosis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Patient" ("consent", "created_at", "diagnosis_id", "id", "updated_at", "user_id") SELECT "consent", "created_at", "diagnosis_id", "id", "updated_at", "user_id" FROM "Patient";
DROP TABLE "Patient";
ALTER TABLE "new_Patient" RENAME TO "Patient";
CREATE UNIQUE INDEX "Patient_user_id_key" ON "Patient"("user_id");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT DEFAULT '',
    "email" TEXT NOT NULL,
    "password" TEXT,
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "account_role" TEXT,
    "account_permissions" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" DATETIME
);
INSERT INTO "new_User" ("account_permissions", "account_role", "account_status", "created_at", "created_by", "deleted_at", "email", "id", "name", "password", "updated_at", "updated_by") SELECT "account_permissions", "account_role", "account_status", "created_at", "created_by", "deleted_at", "email", "id", "name", "password", "updated_at", "updated_by" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
