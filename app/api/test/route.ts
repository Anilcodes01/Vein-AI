import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "../../lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import { generateNutritionRecommendation } from "@/app/lib/gemini";

export const runtime = "nodejs";

const IDENTITY_VALUES = ["Male", "Female", "Other"] as const;
const ACTIVITY_LEVEL_VALUES = [
  "RELAXED_HOMEBODY",
  "CASUAL_MOVER",
  "PRETTY_ACTIVE",
  "FITNESS_BEAST",
] as const;
const AVERAGE_SLEEP_VALUES = [
  "LESS_THAN_4",
  "BETWEEN_4_TO_6",
  "SOLID_6_TO_8",
  "MORE_THAN_8",
] as const;
const FITNESS_SUPERPOWER_VALUES = [
  "NEVER_FEEL_TIRED",
  "INSTANT_MUSCLE_GAIN",
  "EFFORTLESS_HEALTHY_EATING",
  "UNSHAKEABLE_MOTIVATION",
] as const;

type IdentityValue = (typeof IDENTITY_VALUES)[number];
type ActivityLevelValue = (typeof ACTIVITY_LEVEL_VALUES)[number];
type AverageSleepValue = (typeof AVERAGE_SLEEP_VALUES)[number];
type FitnessSuperpowerValue = (typeof FITNESS_SUPERPOWER_VALUES)[number];

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.name || !body.userId) {
      return NextResponse.json(
        { error: "Name and userId are required" },
        { status: 400 }
      );
    }

    if (body.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    function safeEnumValue<T extends string>(
      value: unknown,
      allowedValues: readonly T[]
    ): T | null {
      if (typeof value === "string" && allowedValues.includes(value as T)) {
        return value as T;
      }
      return null;
    }

    const userDetailsData = {
      age: body.age ? parseInt(body.age) : null,
      identity: safeEnumValue<IdentityValue>(body.identity, IDENTITY_VALUES),
      height: body.height ? parseInt(body.height) : null,
      weight: body.weight ? parseInt(body.weight) : null,
      activityLevel: safeEnumValue<ActivityLevelValue>(
        body.activityLevel,
        ACTIVITY_LEVEL_VALUES
      ),
      averageSleep: safeEnumValue<AverageSleepValue>(
        body.averageSleep,
        AVERAGE_SLEEP_VALUES
      ),
      fitnessSuperpower: safeEnumValue<FitnessSuperpowerValue>(
        body.fitnessSuperpower,
        FITNESS_SUPERPOWER_VALUES
      ),
      mainGoals: body.maingoal ? [body.maingoal] : [],
      preferredWorkouts: body.preferredWorkouts ? [body.preferredWorkouts] : [],
      dietaryApproaches: body.dietaryApproach ? [body.dietaryApproach] : [],
      biggestChallenges: body.biggestChallenge ? [body.biggestChallenge] : [],
      rawData: body,
    };

    await prisma.$transaction([
      prisma.user.update({
        where: { id: body.userId },
        data: {
          name: body.name,
        },
      }),
      prisma.userDetails.upsert({
        where: { userId: body.userId },
        update: userDetailsData,
        create: {
          userId: body.userId,
          ...userDetailsData,
        },
      }),
    ]);

    const nutritionResult = await generateNutritionRecommendation(userDetailsData);
    const nutritionalData = nutritionResult.data;

    const saveUserDashData = await prisma.userDashData.create({
      data: {
        userId: userId!,
        calorieIntake: nutritionalData.calorieIntake,
        waterIntake: nutritionalData.waterIntakeLiters * 1000,
        carbohydrateIntake: nutritionalData.carbohydrateIntake,
        fatIntake: nutritionalData.fatIntake,
        proteinIntake: nutritionalData.proteinIntake,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: saveUserDashData,
        recommendationSource: nutritionResult.source,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error saving user data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
