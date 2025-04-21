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
              text: "You're Vein, a personal and very friendly health assistant and answers user's query based on their data. Make it conversational, highly personal and don't repeat things and keep responses short and good looking, try your best to not answer in points",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "I am Vein, a personal and very friendly health assistant who answers user's query based on their data. I will keep it conversational, highly personal, and I will not repeat things and I will keep responses short and good looking, I will try my best to not answer in points. ",
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

async function generateGeminiResponse({
  message,
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
`;

    const fullMessage = `${context}\n\nUser question: ${message}`;
    const response = await chat.sendMessage({ message: fullMessage });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini SDK error:", error);
    throw new Error("Failed to generate response with Gemini SDK");
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, message } = await request.json();
    const userId = session.user.id;
    const name = session.user.name;

    if (!message) {
      return NextResponse.json(
        { message: "No message provided" },
        { status: 400 }
      );
    }

    let conversation = await prisma.conversation.findFirst({
      where: { id: conversationId },
    });

    if (!conversationId) {
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: message.slice(0, 30),
        },
      });
    }

    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    const userDetails = await prisma.userDetails.findFirst({
      where: { userId },
      select: {
        age: true,
        activityLevel: true,
        height: true,
        weight: true,
        dietaryApproaches: true,
        identity: true,
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

    console.log(`Querying nutritional data for user's local date: ${localDateString} (Timezone: ${userTimezone})`);
    console.log("Corresponding target UTC date:", targetDateUTC.toISOString());
    console.log("Current local time:", now.toLocaleString('en-IN', { timeZone: userTimezone }));


    const nutritionalLogData = await prisma.userNutritionLog.findFirst({
      where: {
        userId,
        date: {
          equals: targetDateUTC
        }
      },
      select: {
        id: true, 
        date: true,
        createdAt: true,
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
            mealtime: true,
            calories: true,
            protein: true,
            carbs: true,
            fat: true,
            waterMl: true,
            time: true,
          },
           orderBy: {
             time: 'asc'
           }
        },
      },
    });

    console.log("Nutritional log data found:", nutritionalLogData ? `Log ID: ${nutritionalLogData.id}, Log Date: ${nutritionalLogData.date?.toISOString()}` : "None found for target date");


    const aiResponse = await generateGeminiResponse({
      message,
      userDetails,
      userNutritionalData,
      name,
      nutritionalLogData
    });

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "ai",
        content: aiResponse,
      },
    });

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
      messages: [userMessage, assistantMessage],
      userData: userDetails || null,
    });

  } catch (error) {
    console.error("API error:", error);
     if (error instanceof RangeError && error.message.includes("Invalid time zone specified")) {
       console.error("Invalid timezone provided:", error);
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