-- CreateEnum
CREATE TYPE "HabitType" AS ENUM ('CHECK_IN', 'COUNT', 'TIME');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "TimeOfDay" AS ENUM ('ANY', 'MORNING', 'AFTERNOON', 'EVENING');

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "reason" TEXT,
    "icon" TEXT,
    "type" "HabitType" NOT NULL,
    "target" INTEGER,
    "targetUnit" TEXT,
    "frequencyDays" "DayOfWeek"[],
    "timeOfDay" "TimeOfDay",
    "reminders" BOOLEAN NOT NULL DEFAULT false,
    "reminderTime" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
