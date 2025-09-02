/*
  Warnings:

  - You are about to drop the column `athleteId` on the `MealPlan` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_AthleteToMealPlan" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_AthleteToMealPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_AthleteToMealPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MealPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_MealPlan" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "MealPlan";
DROP TABLE "MealPlan";
ALTER TABLE "new_MealPlan" RENAME TO "MealPlan";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_AthleteToMealPlan_AB_unique" ON "_AthleteToMealPlan"("A", "B");

-- CreateIndex
CREATE INDEX "_AthleteToMealPlan_B_index" ON "_AthleteToMealPlan"("B");
