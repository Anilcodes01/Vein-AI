import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
   

    const { userData } = await req.json();

    const saveUser = await prisma.userDetails.create({
      data: {
        userId: userData.userId,
        age: userData.age,
        identity: userData.identity,
        height: userData.height,
        weight: userData.weight,
        activityLevel: userData.activity_level,
        averageSleep: userData.average_sleep,
        fitnessSuperpower: userData.fitness_superpower,
        mainGoals: userData.main_goal,
        preferredWorkouts: userData.preferred_workouts,
        dietaryApproaches: userData.dietary_approach,
        biggestChallenges: userData.biggest_challenge,
        rawData: userData,
      },
    });

    return NextResponse.json(
      {
        message: "User data saved successfully...!",
        saveUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while saving data...",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
