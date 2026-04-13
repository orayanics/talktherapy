/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `user` table. All the data in the column will be lost.
  - Made the column `role` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL,
    "banned" BOOLEAN DEFAULT false,
    "banReason" TEXT,
    "banExpires" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "diagnosis_id" TEXT,
    CONSTRAINT "user_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "Diagnosis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_user" ("banExpires", "banReason", "banned", "createdAt", "email", "emailVerified", "id", "image", "name", "role", "status", "updatedAt") SELECT "banExpires", "banReason", "banned", "createdAt", "email", "emailVerified", "id", "image", "name", "role", "status", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_label_key" ON "Diagnosis"("label");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnosis_value_key" ON "Diagnosis"("value");
