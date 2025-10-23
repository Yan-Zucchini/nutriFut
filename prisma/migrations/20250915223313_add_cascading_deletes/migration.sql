-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FoodItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mealPlanId" INTEGER NOT NULL,
    "foodId" TEXT NOT NULL,
    "foodName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    CONSTRAINT "FoodItem_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FoodItem" ("foodId", "foodName", "id", "mealPlanId", "mealType", "quantity", "unit") SELECT "foodId", "foodName", "id", "mealPlanId", "mealType", "quantity", "unit" FROM "FoodItem";
DROP TABLE "FoodItem";
ALTER TABLE "new_FoodItem" RENAME TO "FoodItem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
