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
      - CaloriesNeed: ${userNutritionalData?.calorieIntake || "not provided"}
      - CarbsNeed: ${userNutritionalData?.carbohydrateIntake || "not provided"}
      - FatsNeed: ${userNutritionalData?.fatIntake || "not provided"}
      - ProteinNeed: ${userNutritionalData?.proteinIntake || "not provided"}
      - WaterNeed: ${userNutritionalData?.waterIntake || "not provided"}
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
      return NextResponse.json({ message: "No message provided" }, { status: 400 });
    }

    // Get or create the conversation
    let conversation = await prisma.conversation.findFirst({
      where: { id: conversationId },
    });

    if (!conversationId) {
      conversation = await prisma.conversation.create({
        data: {
        
          userId,
          title: message.slice(0, 30), // Title from first message
        },
      });
    }

    // Save the user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Fetch user context
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

    // Generate response
    const aiResponse = await generateGeminiResponse({
      message,
      userDetails,
      userNutritionalData,
      name,
    });

    // Save the AI response
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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
