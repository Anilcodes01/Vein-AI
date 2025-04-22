import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { GoogleGenAI } from "@google/genai";
import prisma from "../../lib/prisma";
import { authOptions } from "@/app/lib/authOptions";
import {
  ActivityLevel,
  AverageSleep,
  FitnessSuperpower,
  Identity,
} from "@prisma/client";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function queryGemini(userData: any) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Based on the following user information, provide nutritional recommendations in JSON format exactly as specified:
User Data:
- Age: ${userData.age}
- Height: ${userData.height}
- Weight: ${userData.weight}
- Identity: ${userData.identity}
- Main Goals: ${userData.mainGoals}
- Average Sleep: ${userData.averageSleep}
- Activity Level: ${userData.activityLevel}
- Dietary Approaches: ${userData.dietaryApproaches}
- Biggest Challenges: ${userData.biggestChallenges}
- Preferred Workouts: ${userData.preferredWorkouts}
- Fitness Superpower: ${userData.fitnessSuperpower}

Return the data in this exact JSON format:
nutritionalData = {
  "calorieIntake": number,
  "proteinIntake": number,
  "carbohydrateIntake": number,
  "fatIntake": number,
  "waterIntakeLiters": number
}

Return : Array<nutritionalData>
`,
  });
  const rawData = response.text!;
  const cleanedJsonString = rawData.replace(/```json\n|\n```/g, "");
  const parsedArray = JSON.parse(cleanedJsonString);
  const nutritionalData = parsedArray[0];
  console.log(nutritionalData);
  return nutritionalData;
}

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

    function safeEnumValue<T>(value: any, enumType: any): T | null {
      if (Object.values(enumType).includes(value)) {
        return value as T;
      }
      return null;
    }

    const userDetailsData = {
      age: body.age ? parseInt(body.age) : null,
      identity: safeEnumValue<Identity>(body.identity, Identity),
      height: body.height ? parseInt(body.height) : null,
      weight: body.weight ? parseInt(body.weight) : null,
      activityLevel: safeEnumValue<ActivityLevel>(
        body.activityLevel,
        ActivityLevel
      ),
      averageSleep: safeEnumValue<AverageSleep>(
        body.averageSleep,
        AverageSleep
      ),
      fitnessSuperpower: safeEnumValue<FitnessSuperpower>(
        body.fitnessSuperpower,
        FitnessSuperpower
      ),
      mainGoals: body.maingoal ? [body.maingoal] : [],
      preferredWorkouts: body.preferredWorkouts ? [body.preferredWorkouts] : [],
      dietaryApproaches: body.dietaryApproach ? [body.dietaryApproach] : [],
      biggestChallenges: body.biggestChallenge ? [body.biggestChallenge] : [],
      rawData: body,
    };

    const result = await prisma.$transaction([
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

    const nutritionalData = await queryGemini(userDetailsData);

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
      { success: true, data: saveUserDashData },
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
