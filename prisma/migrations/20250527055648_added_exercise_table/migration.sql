-- AlterTable
ALTER TABLE "UserNutritionLog" ADD COLUMN     "totalCaloriesBurned" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ExerciseEntry" (
    "id" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "duration" INTEGER,
    "caloriesBurned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "source" "EntrySource" NOT NULL DEFAULT 'chat',

    CONSTRAINT "ExerciseEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExerciseEntry" ADD CONSTRAINT "ExerciseEntry_logId_fkey" FOREIGN KEY ("logId") REFERENCES "UserNutritionLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
