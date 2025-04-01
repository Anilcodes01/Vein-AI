import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

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
  `
    })


const rawData = response.text!

const cleanedJsonString = rawData.replace(/```json\n|\n```/g, "");

const parsedArray = JSON.parse(cleanedJsonString);

const nutritionalData = parsedArray[0];

console.log(nutritionalData);

return nutritionalData


}

export async function POST(req: NextRequest, res: NextResponse) {
  try {
   const session = await getServerSession(authOptions);

   const userId = session?.user.id;

    const userInfo = await prisma.userDetails.findFirst({
      where: {
        userId: userId
      },
      select: {
        age: true, 
        height: true, 
        weight: true,
        identity: true,
        mainGoals: true,
        averageSleep: true,
        activityLevel: true,
        dietaryApproaches: true,
        biggestChallenges: true,
        preferredWorkouts: true,
        fitnessSuperpower: true
      }
    });

    if (!userInfo) {
      return NextResponse.json(
        {
          message: 'User information not found'
        }, 
        { status: 404 }
      );
    }

    const nutritionalData = await queryGemini(userInfo);

    const saveUserDashData = await prisma.userDashData.create({
      data: {
        userId: userId!,
        calorieIntake: nutritionalData.calorieIntake,
        waterIntake: nutritionalData.waterIntake,
        carbohydrateIntake: nutritionalData.carbohydrateIntake,
        fatIntake: nutritionalData.fatIntake,
        proteinIntake: nutritionalData.proteinIntake
      }
    })


    return NextResponse.json(
      {
        message: 'Nutritional data retrieved successfully',
        data: saveUserDashData
      }, 
      { status: 200 }
    );
    
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Error while fetching user dashboard data...!',
        error: error.message
      }, 
      { status: 500 }
    );
  }
}