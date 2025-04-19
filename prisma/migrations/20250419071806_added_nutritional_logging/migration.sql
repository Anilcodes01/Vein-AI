-- CreateEnum
CREATE TYPE "EntrySource" AS ENUM ('manual', 'photo', 'chat', 'auto_suggest');

-- CreateTable
CREATE TABLE "UserNutritionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalCalories" INTEGER NOT NULL DEFAULT 0,
    "totalProtein" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalFat" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalCarbs" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalWaterMl" INTEGER NOT NULL DEFAULT 0,
    "moodBefore" TEXT,
    "moodAfter" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNutritionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionEntry" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "source" "EntrySource" NOT NULL DEFAULT 'chat',
    "description" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "waterMl" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserNutritionLog" ADD CONSTRAINT "UserNutritionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionEntry" ADD CONSTRAINT "NutritionEntry_logId_fkey" FOREIGN KEY ("logId") REFERENCES "UserNutritionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
