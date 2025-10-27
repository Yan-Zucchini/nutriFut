/*
  Warnings:

  - You are about to drop the column `height` on the `Athlete` table. All the data in the column will be lost.
  - You are about to drop the column `weight` on the `Athlete` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "DailyLogEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eatenAt" DATETIME NOT NULL,
    "mealType" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "kcal" REAL NOT NULL,
    "protein" REAL NOT NULL,
    "carbohydrates" REAL NOT NULL,
    "lipids" REAL NOT NULL,
    "athleteId" INTEGER NOT NULL,
    CONSTRAINT "DailyLogEntry_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Athlete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "weightInKg" REAL,
    "heightInMeters" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Athlete" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "Athlete";
DROP TABLE "Athlete";
ALTER TABLE "new_Athlete" RENAME TO "Athlete";
CREATE UNIQUE INDEX "Athlete_email_key" ON "Athlete"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
