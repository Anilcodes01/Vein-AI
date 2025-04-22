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

    let cleanedJsonString = response.text.trim();
    cleanedJsonString = cleanedJsonString.replace(/```json|```/g, "");
    const parsedData = JSON.parse(cleanedJsonString);

    const requiredFields = ["calories", "protein", "fat", "carbs"];
    for (const field of requiredFields) {
      if (typeof parsedData[field] !== "number") {
        throw new Error(`Missing or invalid ${field} field`);
      }
    }

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

async function updateUserWaterStreak(userId: string, logDate: Date, totalWaterMlToday: number) {
  try {
      console.log(`Updating water streak for user ${userId} on date ${logDate.toISOString()}`);

      const userDashData = await prisma.userDashData.findFirst({
          where: { userId },
      });

      if (!userDashData || !userDashData.waterIntake || userDashData.waterIntake <= 0) {
          console.log(`User ${userId} has no water intake goal set. Skipping streak update.`);
          return null;
      }

      const waterGoal = userDashData.waterIntake;
      const goalMet = totalWaterMlToday >= waterGoal;

      console.log(`User ${userId} water goal: ${waterGoal}ml, Today's total: ${totalWaterMlToday}ml. Goal met: ${goalMet}`);

      const startOfDay = new Date(Date.UTC(logDate.getUTCFullYear(), logDate.getUTCMonth(), logDate.getUTCDate()));
      const startOfYesterday = new Date(startOfDay);
      startOfYesterday.setUTCDate(startOfYesterday.getUTCDate() - 1);

      const currentStreak = await prisma.streak.findUnique({
          where: { userId_type: { userId, type: 'water' } },
      });

      let newCurrentStreak = 0;
      let newLongestStreak = currentStreak?.longest ?? 0;

      const isConsecutive = currentStreak && currentStreak.lastUpdated >= startOfYesterday && currentStreak.lastUpdated < startOfDay;

      if (goalMet) {
          if (isConsecutive) {
              newCurrentStreak = (currentStreak?.current ?? 0) + 1;
          } else {
              newCurrentStreak = 1;
          }
          newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
      } else {
          newCurrentStreak = 0;
      }

      console.log(`Values before upsert: newCurrentStreak=${newCurrentStreak}, newLongestStreak=${newLongestStreak}, lastUpdated=${startOfDay.toISOString()}`);

      const updatedStreak = await prisma.streak.upsert({
          where: { userId_type: { userId, type: 'water' } },
          create: {
              userId,
              type: 'water',
              current: newCurrentStreak,
              longest: newLongestStreak,
              lastUpdated: startOfDay,
          },
          update: {
              current: newCurrentStreak,
              longest: newLongestStreak,
              lastUpdated: startOfDay,
          },
      });

      console.log(`Successfully updated/re-evaluated water streak for user ${userId}:`, updatedStreak);
      return updatedStreak;

  } catch (error) {
      console.error(`Error updating water streak for user ${userId}:`, error);
      return null;
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
    const { description, mealtime, timestamp, date } = body;

    if (!description || !mealtime || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const validMealTimes = ["breakfast", "lunch", "dinner", "snack"] as const;
    if (!validMealTimes.includes(mealtime.toLowerCase())) {
      return NextResponse.json({ error: "Invalid mealtime" }, { status: 400 });
    }

    const logDate = new Date(date);
    if (isNaN(logDate.getTime())) {
        return NextResponse.json({ error: "Invalid date format. Use YYYY-MM-DD." }, { status: 400 });
    }
    const startOfDay = new Date(Date.UTC(logDate.getUTCFullYear(), logDate.getUTCMonth(), logDate.getUTCDate()));

    const entryTime = timestamp ? new Date(timestamp) : new Date();

    try {
      const parsed = await callGeminiNutritionExtractory(description);

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

      const newEntry = await prisma.nutritionEntry.create({
        data: {
          logId: log.id,
          time: entryTime, 
          mealtime: mealtime.toLowerCase(),
          source: "chat", 
          description,
          calories: parsed.calories,
          protein: parsed.protein,
          fat: parsed.fat,
          carbs: parsed.carbs,
          waterMl: parsed.waterMl ?? 0,
        },
      });

      const allEntriesForLog = await prisma.nutritionEntry.findMany({
        where: { logId: log.id },
      });

      const totals = allEntriesForLog.reduce(
        (acc, e) => {
          acc.calories += e.calories || 0; 
          acc.protein += e.protein || 0;
          acc.fat += e.fat || 0;
          acc.carbs += e.carbs || 0;
          acc.waterMl += e.waterMl || 0;
          return acc;
        },
        { calories: 0, protein: 0, fat: 0, carbs: 0, waterMl: 0 }
      );

      const updatedLog = await prisma.userNutritionLog.update({
        where: { id: log.id },
        data: {
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalFat: totals.fat,
          totalCarbs: totals.carbs,
          totalWaterMl: totals.waterMl,
        },
        include: { entries: true }
      });

      const updatedStreak = await updateUserWaterStreak(userId, logDate, updatedLog.totalWaterMl);
      console.log("Streak updated:", updatedStreak);

      return NextResponse.json({ success: true, entry: newEntry, updatedLog, streakInfo: updatedStreak  });
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