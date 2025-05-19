import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { format } from 'date-fns-tz';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let chat = null;

function initChat() {
  if (!chat) {
    chat = ai.chats.create({
      model: "gemini-2.0-flash",
      history: [
        {
          role: "user",
          parts: [
            {
              text: "You're Vein, a personal and very friendly health assistant. Looking over the data of user give a single line motivational quote. should be related to user data.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "I am Vein, a personal and very friendly health assistant who motivates user by a single line  motivational quote by looking over the user's data. should be related to user data",
            },
          ],
        },
      ],
      config: {
        temperature: 0.4,
      },
    });
  }
}

async function generateMotivationalQuote({
  userDetails,
  userNutritionalData,
  name,
  nutritionalLogData,
}) {
  try {
    initChat();

    const context = `
  User details:
  - Name: ${name}
  - Age: ${userDetails?.age || "not provided"}
  - Activity level: ${userDetails?.activityLevel || "not provided"}
  - Height: ${userDetails?.height || "not provided"}
  - Weight: ${userDetails?.weight || "not provided"}
  - Dietary approach: ${userDetails?.dietaryApproaches || "not provided"}
  - Identity: ${userDetails?.identity || "not provided"}

  Nutritional data:
  - CaloriesNeed: ${userNutritionalData?.calorieIntake || "not provided"}
  - CarbsNeed: ${userNutritionalData?.carbohydrateIntake || "not provided"}
  - FatsNeed: ${userNutritionalData?.fatIntake || "not provided"}
  - ProteinNeed: ${userNutritionalData?.proteinIntake || "not provided"}
  - WaterNeed: ${userNutritionalData?.waterIntake || "not provided"}

  Today's intake:
  - Calories consumed: ${nutritionalLogData?.totalCalories || "not logged yet"}
  - Carbs consumed: ${nutritionalLogData?.totalCarbs || "not logged yet"}
  - Fats consumed: ${nutritionalLogData?.totalFat || "not logged yet"}
  - Protein consumed: ${nutritionalLogData?.totalProtein || "not logged yet"}
  - Water consumed: ${nutritionalLogData?.totalWaterMl || "not logged yet"}
  - Mood before meals: ${nutritionalLogData?.moodBefore || "not logged yet"}
  - Mood after meals: ${nutritionalLogData?.moodAfter || "not logged yet"}
  - What I ate: ${nutritionalLogData?.entries.map(entry => `${entry.description} (${entry.calories} calories)`).join(", ") || "not logged yet"}
`;

    const response = await chat.sendMessage({ 
      message: `${context}\n\nPlease provide a motivational quote based on my health data.`
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini SDK error:", error);
    throw new Error("Failed to generate motivational quote");
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const name = session.user.name;

    const userDetails =  prisma.userDetails.findFirst({
      where: { userId },
      select: {
        age: true,
        activityLevel: true,
        height: true,
        weight: true,
        dietaryApproaches: true,
        identity: true,
        timezone: true,
      },
    });

    const userNutritionalData = await prisma.userDashData.findFirst({
      where: { userId },
      select: {
        calorieIntake: true,
        carbohydrateIntake: true,
        fatIntake: true,
        proteinIntake: true,
        waterIntake: true,
      },
    });

    const now = new Date();
    const userTimezone = userDetails?.timezone || 'Asia/Kolkata';
    const localDateString = format(now, 'yyyy-MM-dd', { timeZone: userTimezone });

    const targetDateUTC = new Date(Date.UTC(
      parseInt(localDateString.substring(0, 4)),
      parseInt(localDateString.substring(5, 7)) - 1,
      parseInt(localDateString.substring(8, 10)),
      0, 0, 0, 0
    ));

    const nutritionalLogData = await prisma.userNutritionLog.findFirst({
      where: {
        userId,
        date: {
          equals: targetDateUTC
        }
      },
      select: {
        totalCalories: true,
        totalCarbs: true,
        totalFat: true,
        totalProtein: true,
        totalWaterMl: true,
        moodAfter: true,
        moodBefore: true,
        entries: {
          select: {
            description: true,
            calories: true,
          },
        },
      },
    });

    const motivationalQuote = await generateMotivationalQuote({
      userDetails,
      userNutritionalData,
      name,
      nutritionalLogData
    });

    return NextResponse.json({
      quote: motivationalQuote,
      userData: userDetails || null,
    });

  } catch (error) {
    console.error("API error:", error);
    if (error instanceof RangeError && error.message.includes("Invalid time zone specified")) {
      return NextResponse.json(
        { message: "Internal server error due to invalid timezone configuration." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}