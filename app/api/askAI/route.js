import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

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
  name
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
      - Calories: ${userNutritionalData?.calorieIntake || "not provided"}
      - Carbs: ${userNutritionalData?.carbohydrateIntake || "not provided"}
      - Fats: ${userNutritionalData?.fatIntake || "not provided"}
      - Protein: ${userNutritionalData?.proteinIntake || "not provided"}
      - Water: ${userNutritionalData?.waterIntake || "not provided"}
    `;

    const fullMessage = `${context}\n\nUser question: ${message}`;

    const response = await chat.sendMessage({
      message: fullMessage,
    });

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

    const userId = session.user.id;
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { message: "No message provided" },
        { status: 400 }
      );
    }

    const name = session.user.name;

    // Fixed Prisma queries - using proper where clauses
    const userDetails = await prisma.userDetails.findFirst({
      where: { userId }, // Changed to object with userId field
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
      where: { userId }, // Changed to object with userId field
      select: {
        calorieIntake: true,
        carbohydrateIntake: true,
        fatIntake: true,
        proteinIntake: true,
        waterIntake: true,
      },
    });

    const response = await generateGeminiResponse({
      message,
      userDetails,
      userNutritionalData,
      name
    });

    return NextResponse.json({
      response,
      userData: userDetails || null,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
