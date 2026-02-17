/*
  Warnings:

  - You are about to drop the column `account_json` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `account_type` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `remember_token` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "account_role" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    "deleted_at" DATETIME
);
INSERT INTO "new_User" ("account_role", "account_status", "created_at", "created_by", "deleted_at", "email", "id", "name", "password", "updated_at", "updated_by") SELECT "account_role", "account_status", "created_at", "created_by", "deleted_at", "email", "id", "name", "password", "updated_at", "updated_by" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
