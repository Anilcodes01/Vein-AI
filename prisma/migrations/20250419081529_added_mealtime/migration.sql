/*
  Warnings:

  - Added the required column `mealtime` to the `NutritionEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MealTime" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack');

-- AlterTable
ALTER TABLE "NutritionEntry" ADD COLUMN     "mealtime" "MealTime" NOT NULL;
