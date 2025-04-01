-- CreateTable
CREATE TABLE "UserDashData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "calorieIntake" INTEGER NOT NULL,
    "proteinIntake" INTEGER NOT NULL,
    "fatIntake" INTEGER NOT NULL,
    "carbohydrateIntake" INTEGER NOT NULL,
    "waterIntake" INTEGER NOT NULL,

    CONSTRAINT "UserDashData_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDashData" ADD CONSTRAINT "UserDashData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
