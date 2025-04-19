import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiNutritionExtractory(description: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `
          Extract nutritional info from this sentence: "${description}".
          Return a JSON object with these keys:
          calories (number), protein (g), fat (g), carbs (g), waterMl (ml if any). Only numbers.
          
          Example response:
          {
            "calories": 300,
            "protein": 20,
            "fat": 10,
            "carbs": 30,
            "waterMl": 250
          }
          
          Respond ONLY with the JSON object. Do not include any additional text or markdown.
          `,
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    // Clean the response string
    let cleanedJsonString = response.text.trim();

    // Remove JSON markdown if present
    cleanedJsonString = cleanedJsonString.replace(/```json|```/g, "");

    // Parse the JSON
    const parsedData = JSON.parse(cleanedJsonString);

    // Validate the required fields
    const requiredFields = ["calories", "protein", "fat", "carbs"];
    for (const field of requiredFields) {
      if (typeof parsedData[field] !== "number") {
        throw new Error(`Missing or invalid ${field} field`);
      }
    }

    // Set default for optional field
    if (typeof parsedData.waterMl !== "number") {
      parsedData.waterMl = 0;
    }

    console.log("Extracted data:", parsedData);
    return parsedData;
  } catch (error: any) {
    console.error("Error parsing Gemini response:", error);
    throw new Error(`Failed to parse nutrition data: ${error.message}`);
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
    const { description, mealtime, timestamp } = body;

    const validMealTimes = ["breakfast", "lunch", "dinner", "snack"] as const;
    if (!validMealTimes.includes(mealtime)) {
      return NextResponse.json({ error: "Invalid mealtime" }, { status: 400 });
    }

    if (!description || !mealtime) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    try {
      const parsed = await callGeminiNutritionExtractory(description);

      const entryTime = timestamp ? new Date(timestamp) : new Date();
      const startOfDay = new Date(entryTime);
      startOfDay.setUTCHours(0, 0, 0, 0);

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

      const entry = await prisma.nutritionEntry.create({
        data: {
          logId: log.id,
          time: timestamp ? new Date(timestamp) : new Date(),
          mealtime: mealtime,
          source: "chat",
          description,
          calories: parsed.calories,
          protein: parsed.protein,
          fat: parsed.fat,
          carbs: parsed.carbs,
          waterMl: parsed.waterMl ?? 0,
        },
      });

      const entries = await prisma.nutritionEntry.findMany({
        where: { logId: log.id },
      });

      const totals = entries.reduce(
        (acc, e) => {
          acc.calories += e.calories;
          acc.protein += e.protein;
          acc.fat += e.fat;
          acc.carbs += e.carbs;
          acc.waterMl += e.waterMl;
          return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0, waterMl: 0 }
      );

      const totalEntries = await prisma.userNutritionLog.update({
        where: { id: log.id },
        data: {
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalFat: totals.fat,
          totalCarbs: totals.carbs,
          totalWaterMl: totals.waterMl,
        },
      });

      return NextResponse.json({ success: true, entry, totalEntries });
    } catch (error: any) {
      console.error("Nutrition extraction error:", error);
      return NextResponse.json(
        {
          error: "Could not extract nutrition information",
          details: error.message,
          suggestion:
            "Please try being more specific (e.g., '200g chicken breast with 1 cup rice')",
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      {
        message: "Error while fetching the nutrional data...!",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
