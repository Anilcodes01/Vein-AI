import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiExerciseExtractor(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
          Extract exercise info from this sentence: "${description}".
          Return a JSON object with these keys:
          duration (minutes), caloriesBurned (number). Only numbers.
          
          Example response:
          {
            "duration": 30,
            "caloriesBurned": 250
          }
          
          Respond ONLY with the JSON object. Do not include any additional text or markdown.
          `,
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    let cleanedJsonString = response.text.trim();
    cleanedJsonString = cleanedJsonString.replace(/```json|```/g, "");
    const parsedData = JSON.parse(cleanedJsonString);

    const requiredFields = ["caloriesBurned"];
    for (const field of requiredFields) {
      if (typeof parsedData[field] !== "number") {
        throw new Error(`Missing or invalid ${field} field`);
      }
    }

    if (typeof parsedData.duration !== "number") {
      parsedData.duration = 0;
    }

    console.log("Extracted exercise data:", parsedData);
    return parsedData;
  } catch (error: any) {
    console.error("Error parsing Gemini response:", error);
    throw new Error(`Failed to parse exercise data: ${error.message}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { description, timestamp, date } = body;

    if (!description || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const logDate = new Date(date);
    if (isNaN(logDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    const startOfDay = new Date(Date.UTC(logDate.getUTCFullYear(), logDate.getUTCMonth(), logDate.getUTCDate()));

    const entryTime = timestamp ? new Date(timestamp) : new Date();

    try {
      const parsed = await callGeminiExerciseExtractor(description);

      let log = await prisma.userNutritionLog.findFirst({
        where: {
          userId,
          date: startOfDay,
        },
      });

      if (!log) {
        log = await prisma.userNutritionLog.create({
          data: {
            userId,
            date: startOfDay,
          },
        });
      }

      const newEntry = await prisma.exerciseEntry.create({
        data: {
          logId: log.id,
          time: entryTime,
          description,
          duration: parsed.duration || 0,
          caloriesBurned: parsed.caloriesBurned,
          source: "chat",
        },
      });

      const allExerciseEntriesForLog = await prisma.exerciseEntry.findMany({
        where: { logId: log.id },
      });

      const totalCaloriesBurned = allExerciseEntriesForLog.reduce(
        (sum, entry) => sum + (entry.caloriesBurned || 0),
        0
      );

      const updatedLog = await prisma.userNutritionLog.update({
        where: { id: log.id },
        data: {
          totalCaloriesBurned,
          exerciseEntry: {
            connect: { id: newEntry.id },
          },
        },
        include: { 
          entries: true,
          exerciseEntry: true 
        }
      });

      return NextResponse.json({ 
        success: true, 
        entry: newEntry, 
        updatedLog 
      });
    } catch (error: any) {
      console.error("Exercise extraction error:", error);
      return NextResponse.json(
        {
          error: "Could not extract exercise information",
          details: error.message,
          suggestion: "Please try being more specific (e.g., '30 minute run' or '1 hour weight training')",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while logging exercise...",
        error: error.message,
      },
      { status: 500 }
    );
  }
}