-- CreateTable
CREATE TABLE "UserDetails" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "identity" TEXT NOT NULL,
    "height" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "activity_level" TEXT NOT NULL,
    "averageSleep" TEXT NOT NULL,
    "fitnessSuperpower" TEXT NOT NULL,
    CONSTRAINT "UserDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MainGoal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "goal" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MainGoalOnUser" (
    "userId" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "goalId"),
    CONSTRAINT "MainGoalOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MainGoalOnUser_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "MainGoal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreferredWorkout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workout" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PreferredWorkoutOnUser" (
    "userId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "workoutId"),
    CONSTRAINT "PreferredWorkoutOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PreferredWorkoutOnUser_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "PreferredWorkout" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DietryApproach" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DietryApproachOnUser" (
    "userId" TEXT NOT NULL,
    "dietId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "dietId"),
    CONSTRAINT "DietryApproachOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DietryApproachOnUser_dietId_fkey" FOREIGN KEY ("dietId") REFERENCES "DietryApproach" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BiggestChallenge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "challenge" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BiggestChallengeOnUser" (
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,

    PRIMARY KEY ("userId", "challengeId"),
    CONSTRAINT "BiggestChallengeOnUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BiggestChallengeOnUser_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "BiggestChallenge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDetails_userId_key" ON "UserDetails"("userId");
