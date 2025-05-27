
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";


export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { entryId, type } = body;

    if (!entryId || !type) {
      return NextResponse.json(
        { error: "Missing entryId or type" },
        { status: 400 }
      );
    }

    let entryToDelete;
    let logId: string | null = null;

    if (type === "nutrition") {
      entryToDelete = await prisma.nutritionEntry.findUnique({
        where: { id: entryId },
        select: { logId: true }, 
      });
      if (entryToDelete) {
        const logUser = await prisma.userNutritionLog.findUnique({
            where: {id: entryToDelete.logId},
            select: {userId: true}
        });
        if (logUser?.userId !== userId) {
             return NextResponse.json({ message: "Forbidden: Entry does not belong to user" }, { status: 403 });
        }
        logId = entryToDelete.logId;
        await prisma.nutritionEntry.delete({ where: { id: entryId } });
      }
    } else if (type === "exercise") {
      entryToDelete = await prisma.exerciseEntry.findUnique({
        where: { id: entryId },
        select: { logId: true },
      });
       if (entryToDelete) {
        const logUser = await prisma.userNutritionLog.findUnique({
            where: {id: entryToDelete.logId},
            select: {userId: true}
        });
        if (logUser?.userId !== userId) {
             return NextResponse.json({ message: "Forbidden: Entry does not belong to user" }, { status: 403 });
        }
        logId = entryToDelete.logId;
        await prisma.exerciseEntry.delete({ where: { id: entryId } });
      }
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    if (!entryToDelete || !logId) {
      return NextResponse.json(
        { error: "Entry not found or logId missing" },
        { status: 404 }
      );
    }

    const nutritionEntries = await prisma.nutritionEntry.findMany({
      where: { logId: logId },
    });
    const exerciseEntries = await prisma.exerciseEntry.findMany({
      where: { logId: logId },
    });

    if (nutritionEntries.length === 0 && exerciseEntries.length === 0) {
    
      await prisma.userNutritionLog.delete({ where: { id: logId } });
      return NextResponse.json({ success: true, logDeleted: true, deletedLogId: logId });
    } else {
  
      const totalCalories = nutritionEntries.reduce((sum, e) => sum + (e.calories || 0), 0);
      const totalProtein = nutritionEntries.reduce((sum, e) => sum + (e.protein || 0), 0);
      const totalFat = nutritionEntries.reduce((sum, e) => sum + (e.fat || 0), 0);
      const totalCarbs = nutritionEntries.reduce((sum, e) => sum + (e.carbs || 0), 0);
      const totalWaterMl = nutritionEntries.reduce((sum, e) => sum + (e.waterMl || 0), 0);
      const totalCaloriesBurned = exerciseEntries.reduce((sum, e) => sum + (e.caloriesBurned || 0), 0);

      const updatedLog = await prisma.userNutritionLog.update({
        where: { id: logId },
        data: {
          totalCalories,
          totalProtein,
          totalFat,
          totalCarbs,
          totalWaterMl,
          totalCaloriesBurned,
        },
        include: {
          entries: { orderBy: { time: "asc" } },
          exerciseEntry: { orderBy: { time: "asc" } },
        },
      });
      return NextResponse.json({ success: true, updatedLog });
    }

  } catch (error: any) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { message: "Error deleting entry", error: error.message },
      { status: 500 }
    );
  }
}