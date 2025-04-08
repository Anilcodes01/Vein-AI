import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";

let chat; 

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable");
}
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

async function initChat() {
  if (!chat) {
    console.log("Initializing new Gemini chat session...");
    try {
     
      chat =  ai.chats.create({
        model: "gemini-2.0-flash",
        history: [
          {
            role: "user",
            parts: [{ text: "You're a helpful and friendly health assistant..." }],
          },
          {
            role: "model",
            parts: [{ text: "I am a helpful and very friendly assistant..." }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 200,
          temperature: 0.6,
          topP: 1,
        }
      });
    } catch (error) {
      console.error("Failed to initialize Gemini chat:", error);
      throw new Error("Could not initialize AI chat session.");
    }
  }
}


async function generateGeminiResponse(userMessage, userDetails, userNutritionalData) {
  try {
    await initChat();

    if (!chat) {
      console.error("Chat session is not available.");
      throw new Error("AI chat session failed to initialize.");
    }

    const prompt = `
    User details: ${JSON.stringify(userDetails)}
    Nutritional data: ${JSON.stringify(userNutritionalData)}
    User question: ${userMessage}
    `;

    console.log("Sending prompt to Gemini...");
    const result = await chat.sendMessage({ message: prompt }); 
    const response = result.response;
    console.log(response)
    const aiResponse = response.text.trim();
    console.log(aiResponse)

    if (!response ) {
      console.error("Gemini response or text function is missing:", response);
      throw new Error("Received an invalid response from the AI.");
    }

    console.log("Gemini Response Text:", aiResponse);

    return aiResponse;
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    throw new Error(
      `Failed to get response from AI. Reason: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { message: "No valid message provided" },
        { status: 400 }
      );
    }

    const [getUserIntakeData, getUserDetails] = await Promise.all([
      prisma.userDashData.findFirst({
        where: { userId: userId },
        select: {
          calorieIntake: true,
          proteinIntake: true,
          fatIntake: true,
          carbohydrateIntake: true,
          waterIntake: true
        },
      }),
      prisma.userDetails.findFirst({
        where: { userId: userId },
        select: {
          age: true,
          weight: true,
          height: true,
          identity: true,
          activityLevel: true
          
        },
      })
    ]);

    if (!getUserIntakeData || !getUserDetails) {
      console.warn(`Data not found for user ${userId}`);
    }

    const aiResponseText = await generateGeminiResponse(
      message,
      getUserDetails,
      getUserIntakeData
    );

    if (typeof aiResponseText !== 'string') {
      console.error("generateGeminiResponse did not return a string unexpectedly.");
      throw new Error("Internal error: Failed to get valid AI response text.");
    }

    return NextResponse.json({
      data: aiResponseText,
    });

  } catch (error) {
    console.error("Error in POST /api/askai:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      {
        message: "Error while processing your request",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
