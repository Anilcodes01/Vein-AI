import { authOptions } from "@/app/lib/authOptions";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const whereClause: any = {
      userId: userId,
    };

    // Add date filter if provided
    if (dateParam) {
      const startDate = new Date(dateParam);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateParam);
      endDate.setHours(23, 59, 59, 999);
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Fetch nutrition logs with their entries
    const nutritionLogs = await prisma.userNutritionLog.findMany({
      where: whereClause,
      include: {
        entries: {
          select: {
            id: true,
            time: true,
            mealtime: true,
            description: true,
            calories: true,
            protein: true,
            fat: true,
            carbs: true,
            waterMl: true,
            source: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            time: "asc",
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(nutritionLogs);
  } catch (error: any) {
    return NextResponse.json(
      { message: "Failed to fetch nutrition data", error: error.message },
      { status: 500 }
    );
  }
}